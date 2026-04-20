import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File): Promise<string> {
  const sb = createClient()
  const ext = file.name.split('.').pop() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await sb.storage.from('photos').upload(path, file)
  if (error) throw new Error(error.message)
  const { data } = sb.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadVideo(file: File): Promise<string> {
  const sb = createClient()
  const ext = file.name.split('.').pop() || 'mp4'
  const path = `videos/${crypto.randomUUID()}.${ext}`
  const { error } = await sb.storage.from('photos').upload(path, file, {
    contentType: file.type || 'video/mp4',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = sb.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}
