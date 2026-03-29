import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REPLICATE_API = 'https://api.replicate.com/v1'

// Build a valid stored (uncompressed) ZIP from in-memory buffers — no dependencies needed
function createStoredZip(files: Array<{ name: string; data: Buffer }>): Buffer {
  function crc32(buf: Buffer): number {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    let crc = 0xffffffff
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  const parts: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0

  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8')
    const crc = crc32(file.data)
    const size = file.data.length

    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(0, 8)   // stored
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(size, 18)
    local.writeUInt32LE(size, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    name.copy(local, 30)

    const cd = Buffer.alloc(46 + name.length)
    cd.writeUInt32LE(0x02014b50, 0)
    cd.writeUInt16LE(20, 4)
    cd.writeUInt16LE(20, 6)
    cd.writeUInt16LE(0, 8)
    cd.writeUInt16LE(0, 10)
    cd.writeUInt16LE(0, 12)
    cd.writeUInt16LE(0, 14)
    cd.writeUInt32LE(crc, 16)
    cd.writeUInt32LE(size, 20)
    cd.writeUInt32LE(size, 24)
    cd.writeUInt16LE(name.length, 28)
    cd.writeUInt16LE(0, 30)
    cd.writeUInt16LE(0, 32)
    cd.writeUInt16LE(0, 34)
    cd.writeUInt16LE(0, 36)
    cd.writeUInt32LE(0, 38)
    cd.writeUInt32LE(offset, 42)
    name.copy(cd, 46)

    parts.push(local, file.data)
    central.push(cd)
    offset += 30 + name.length + size
  }

  const cdStart = offset
  const cdSize = central.reduce((s, b) => s + b.length, 0)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(files.length, 8)
  eocd.writeUInt16LE(files.length, 10)
  eocd.writeUInt32LE(cdSize, 12)
  eocd.writeUInt32LE(cdStart, 16)
  eocd.writeUInt16LE(0, 20)

  return Buffer.concat([...parts, ...central, eocd])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 })

  const { photoUrls, triggerWord, brandId } = await request.json()
  if (!photoUrls?.length || !triggerWord || !brandId) {
    return NextResponse.json({ error: 'photoUrls, triggerWord, brandId required' }, { status: 400 })
  }
  if (photoUrls.length < 5) {
    return NextResponse.json({ error: 'At least 5 photos required for training' }, { status: 400 })
  }

  const headers = { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' }

  // Get account username
  const accountRes = await fetch(`${REPLICATE_API}/account`, { headers })
  if (!accountRes.ok) return NextResponse.json({ error: 'Invalid Replicate API key' }, { status: 401 })
  const { username } = await accountRes.json()

  // Download training images
  const imageFiles = await Promise.all(
    photoUrls.map(async (url: string, i: number) => {
      const res = await fetch(url)
      const buf = Buffer.from(await res.arrayBuffer())
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg'
      return { name: `image_${i + 1}.${ext}`, data: buf }
    })
  )

  // Create zip and upload to Replicate files API
  const zip = createStoredZip(imageFiles)
  const fileRes = await fetch(`${REPLICATE_API}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="training_images.zip"',
    },
    body: zip as unknown as BodyInit,
  })
  if (!fileRes.ok) {
    const err = await fileRes.json()
    return NextResponse.json({ error: err.detail || 'Failed to upload images' }, { status: 500 })
  }
  const fileData = await fileRes.json()
  const zipUrl = fileData.urls?.get

  // Get latest flux-dev-lora-trainer version
  const trainerRes = await fetch(`${REPLICATE_API}/models/ostris/flux-dev-lora-trainer`, { headers })
  const trainer = await trainerRes.json()
  const trainerVersion = trainer.latest_version?.id
  if (!trainerVersion) return NextResponse.json({ error: 'Could not fetch trainer version' }, { status: 500 })

  // Create destination model (ignore error if already exists)
  const modelName = `brand-${brandId.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 20)}`
  await fetch(`${REPLICATE_API}/models`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      owner: username,
      name: modelName,
      description: `Brand image model — trigger word: ${triggerWord}`,
      visibility: 'private',
      hardware: 'gpu-a40-large',
    }),
  })

  // Start training
  const trainRes = await fetch(`${REPLICATE_API}/trainings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      destination: `${username}/${modelName}`,
      version: `ostris/flux-dev-lora-trainer:${trainerVersion}`,
      input: {
        input_images: zipUrl,
        trigger_word: triggerWord,
        steps: 1000,
      },
    }),
  })
  const training = await trainRes.json()
  if (!trainRes.ok) {
    return NextResponse.json({ error: training.detail || 'Failed to start training' }, { status: 500 })
  }

  return NextResponse.json({ trainingId: training.id })
}
