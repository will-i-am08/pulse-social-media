'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uid } from '@/lib/utils'
import { uploadImage } from '@/lib/supabase/storage'
import { callClaude } from '@/lib/claude'
import type { Post } from '@/lib/types'
import {
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  BookmarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ClipboardIcon,
} from '@heroicons/react/16/solid'

interface StockItem {
  id: string
  model: string       // "iPhone 12 Pro 128gb"
  variant: string     // colour or details, e.g. "Black"
  price: string       // "465.00"
}

interface RefurbForm {
  brandId: string
  storeAddress: string
  storePhone: string
  warrantyLine: string
  phones: StockItem[]
  laptops: StockItem[]
  bannerbearTemplateUid: string  // optional — if set, render via Bannerbear instead of canvas
}

const STORAGE_KEY = 'pulse_refurb_stock_form'

function emptyItem(): StockItem {
  return { id: uid(), model: '', variant: '', price: '' }
}

const DEFAULTS: RefurbForm = {
  brandId: '',
  storeAddress: '37 Williamson Street, Bendigo',
  storePhone: '0421 206 766',
  warrantyLine: 'All purchases come with a 1 year warranty and a free data transfer from another device.',
  phones: [emptyItem()],
  laptops: [emptyItem()],
  bannerbearTemplateUid: '',
}

/**
 * Builds the Bannerbear modifications array from a form.
 * Template designers should name their layers using these keys:
 *   title, phones, laptops, warranty, address, phone, brand_color
 * Any layers the template doesn't have are silently ignored by Bannerbear.
 */
function buildBannerbearMods(form: RefurbForm, brandColor: string) {
  const lineItem = (i: StockItem) => {
    const v = i.variant ? ` [${i.variant}]` : ''
    const p = i.price ? ` - $${i.price}` : ''
    return `${i.model}${v}${p}`
  }
  const phonesText = form.phones.filter(i => i.model.trim()).map(lineItem).join('\n')
  const laptopsText = form.laptops.filter(i => i.model.trim()).map(lineItem).join('\n')
  return [
    { name: 'title',       text: 'Current Refurb Stock!' },
    { name: 'phones',      text: phonesText },
    { name: 'laptops',     text: laptopsText },
    { name: 'warranty',    text: form.warrantyLine },
    { name: 'address',     text: form.storeAddress },
    { name: 'phone',       text: form.storePhone },
    { name: 'brand_color', color: brandColor },
  ]
}

async function renderViaBannerbear(form: RefurbForm, brandColor: string): Promise<string | null> {
  const res = await fetch('/api/bannerbear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_uid: form.bannerbearTemplateUid,
      modifications: buildBannerbearMods(form, brandColor),
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.imageUrl) {
    throw new Error(data.error || 'Bannerbear render failed')
  }
  return data.imageUrl as string
}

/**
 * Render the refurb stock card to a 1080x1350 (4:5) PNG using canvas.
 * Returns a Blob ready for upload.
 */
function renderRefurbImage(form: RefurbForm, brandColor: string): Promise<Blob | null> {
  return new Promise(resolve => {
    const W = 1080, H = 1350
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) { resolve(null); return }

    // Background
    ctx.fillStyle = '#141313'
    ctx.fillRect(0, 0, W, H)
    // Accent bar
    ctx.fillStyle = brandColor || '#ff5473'
    ctx.fillRect(0, 0, W, 14)
    ctx.fillRect(0, H - 14, W, 14)

    // Title
    ctx.fillStyle = brandColor || '#ff5473'
    ctx.font = 'bold 64px -apple-system, Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Current Refurb Stock!', W / 2, 130)

    let y = 220
    const drawSection = (label: string, items: StockItem[]) => {
      const filled = items.filter(i => i.model.trim())
      if (!filled.length) return
      ctx.fillStyle = '#e6e1e1'
      ctx.font = 'bold 42px -apple-system, Helvetica, Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, 80, y)
      y += 60
      ctx.font = '34px -apple-system, Helvetica, Arial, sans-serif'
      for (const it of filled) {
        const variant = it.variant ? ` [${it.variant}]` : ''
        const left = `${it.model}${variant}`
        const right = it.price ? `$${it.price}` : ''
        ctx.fillStyle = '#e6e1e1'
        ctx.fillText(left, 100, y)
        ctx.fillStyle = brandColor || '#ff5473'
        ctx.textAlign = 'right'
        ctx.fillText(right, W - 80, y)
        ctx.textAlign = 'left'
        y += 56
      }
      y += 30
    }

    drawSection('Instock Phones:', form.phones)
    drawSection('Instock Laptops:', form.laptops)

    // Footer block
    ctx.fillStyle = '#e1bec0'
    ctx.font = '26px -apple-system, Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    const wrap = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ')
      const lines: string[] = []
      let line = ''
      for (const w of words) {
        const t = line ? line + ' ' + w : w
        if (ctx.measureText(t).width > maxWidth) { lines.push(line); line = w }
        else line = t
      }
      if (line) lines.push(line)
      return lines
    }
    const warrantyLines = wrap(form.warrantyLine, W - 160)
    let fy = H - 220
    for (const ln of warrantyLines) { ctx.fillText(ln, W / 2, fy); fy += 36 }
    fy += 16
    ctx.fillStyle = '#e6e1e1'
    ctx.font = 'bold 28px -apple-system, Helvetica, Arial, sans-serif'
    ctx.fillText(form.storeAddress, W / 2, fy)
    fy += 38
    ctx.fillStyle = brandColor || '#ff5473'
    ctx.fillText(form.storePhone, W / 2, fy)

    canvas.toBlob(b => resolve(b), 'image/jpeg', 0.92)
  })
}

function buildCaptionFallback(form: RefurbForm): string {
  const lines: string[] = ['Current Refurb Stock!', '']
  const phones = form.phones.filter(p => p.model.trim())
  if (phones.length) {
    lines.push('Instock Phones:')
    for (const p of phones) {
      const v = p.variant ? ` [${p.variant}]` : ''
      const pr = p.price ? ` - $${p.price}` : ''
      lines.push(`${p.model}${v}${pr}`)
    }
    lines.push('')
  }
  const laptops = form.laptops.filter(l => l.model.trim())
  if (laptops.length) {
    lines.push('Instock Laptops:')
    for (const l of laptops) {
      const v = l.variant ? ` [${l.variant}]` : ''
      const pr = l.price ? ` - $${l.price}` : ''
      lines.push(`${l.model}${v}${pr}`)
    }
    lines.push('')
  }
  lines.push(form.warrantyLine)
  lines.push(`Pop in store at ${form.storeAddress} or give us a call on ${form.storePhone}`)
  return lines.join('\n')
}

export default function RefurbStockPage() {
  const router = useRouter()
  const { brands, posts, savePosts } = useWorkspace()
  const [form, setForm] = useState<RefurbForm>(DEFAULTS)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setForm({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch { /* ignore */ }
  }, [])

  // Auto-select brand if there's only one
  useEffect(() => {
    if (!form.brandId && brands.length === 1) {
      setForm(f => ({ ...f, brandId: brands[0].id }))
    }
  }, [brands, form.brandId])

  // Persist + debounce preview render
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch { /* quota */ }
    if (previewTimer.current) clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(async () => {
      const brand = brands.find(b => b.id === form.brandId)
      const blob = await renderRefurbImage(form, brand?.color || '#ff5473')
      if (blob) setPreviewUrl(URL.createObjectURL(blob))
    }, 250)
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current) }
  }, [form, brands])

  function update<K extends keyof RefurbForm>(key: K, value: RefurbForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function updateItem(section: 'phones' | 'laptops', id: string, patch: Partial<StockItem>) {
    setForm(f => {
      const updated = f[section].map(i => i.id === id ? { ...i, ...patch } : i)
      // Auto-grow: if the last row now has any content, append a fresh empty row
      const last = updated[updated.length - 1]
      if (last && (last.model.trim() || last.variant.trim() || last.price.trim())) {
        updated.push(emptyItem())
      }
      return { ...f, [section]: updated }
    })
  }
  function addItem(section: 'phones' | 'laptops') {
    setForm(f => ({ ...f, [section]: [...f[section], emptyItem()] }))
  }
  function removeItem(section: 'phones' | 'laptops', id: string) {
    setForm(f => {
      const next = f[section].filter(i => i.id !== id)
      return { ...f, [section]: next.length ? next : [emptyItem()] }
    })
  }

  /**
   * Parses a paste from Daniel into stock rows. Recognises sections via lines
   * containing "phone" or "laptop" (case-insensitive). Each item line is matched
   * against patterns like:
   *   "iPhone 12 Pro 128gb [Black] - $465.00"
   *   "Samsung S24 Ultra 256gb White $725"
   *   "2020 13\" M1 MacBook Pro - $950"
   */
  function parsePaste() {
    if (!pasteText.trim()) { toast.error('Nothing to parse'); return }
    const phones: StockItem[] = []
    const laptops: StockItem[] = []
    let bucket: 'phones' | 'laptops' | null = null
    const lines = pasteText.split(/\r?\n/)
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      const low = line.toLowerCase()
      if (/phone/.test(low) && !/\$/.test(line) && line.length < 40) { bucket = 'phones'; continue }
      if (/laptop|macbook stock|computers?/.test(low) && !/\$/.test(line) && line.length < 40) { bucket = 'laptops'; continue }

      // Auto-detect bucket if header missing
      let target = bucket
      if (!target) target = /macbook|laptop|dell|lenovo|hp\b|surface/i.test(line) ? 'laptops' : 'phones'

      // Extract price
      const priceMatch = line.match(/\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/g)
      let price = ''
      if (priceMatch) {
        const last = priceMatch[priceMatch.length - 1]
        price = last.replace(/[^0-9.]/g, '')
      }
      // Extract variant in [brackets]
      let variant = ''
      const bracket = line.match(/\[([^\]]+)\]/)
      if (bracket) variant = bracket[1].trim()

      // Strip price + brackets to get model
      let model = line
        .replace(/\[[^\]]+\]/, '')
        .replace(/\$?\s*[0-9]+(?:[.,][0-9]{1,2})?\s*$/g, '')
        .replace(/[-–—:]\s*$/, '')
        .trim()

      if (!model && !price) continue

      const item: StockItem = { id: uid(), model, variant, price }
      ;(target === 'laptops' ? laptops : phones).push(item)
    }

    if (!phones.length && !laptops.length) { toast.error('Could not parse any items'); return }

    setForm(f => ({
      ...f,
      phones:  phones.length  ? [...phones,  emptyItem()] : f.phones,
      laptops: laptops.length ? [...laptops, emptyItem()] : f.laptops,
    }))
    setPasteText('')
    setShowPaste(false)
    toast.success(`Parsed ${phones.length} phone${phones.length !== 1 ? 's' : ''}, ${laptops.length} laptop${laptops.length !== 1 ? 's' : ''}`)
  }

  async function generateCaption() {
    const brand = brands.find(b => b.id === form.brandId)
    if (!brand) { toast.error('Pick a brand first'); return }
    setGeneratingCaption(true)
    try {
      const stockBlock = buildCaptionFallback(form)
      const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no quotation marks.'
      const prompt = `Write a short, punchy Instagram caption for "${brand.name}" announcing this week's refurb stock drop.
Brand tone: ${brand.tone || 'casual'}
Brand guidelines: ${brand.brand_guidelines || 'Friendly, local, warm.'}
${brand.posting_instructions ? 'MUST follow: ' + brand.posting_instructions : ''}

The caption MUST include this exact stock list block verbatim (do not reformat prices or model names):

${stockBlock}

Lead with one short hook line above the stock block. Keep it warm, casual, local Bendigo voice. ${brand.include_emojis !== false ? 'Use 1-2 emojis max.' : 'No emojis.'} ${brand.include_hashtags !== false ? 'End with 3-5 relevant hashtags.' : 'No hashtags.'}`
      const result = await callClaude(sys, prompt, 700)
      if (result) { setCaption(result); toast.success('Caption generated!') }
      else { setCaption(stockBlock); toast.success('Used template caption') }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
      setCaption(buildCaptionFallback(form))
    } finally {
      setGeneratingCaption(false)
    }
  }

  async function uploadCurrentImage(): Promise<string | null> {
    const brand = brands.find(b => b.id === form.brandId)
    const brandColor = brand?.color || '#ff5473'

    // If a Bannerbear template is configured, render via API and return the hosted URL.
    if (form.bannerbearTemplateUid.trim()) {
      try {
        const url = await renderViaBannerbear(form, brandColor)
        if (url) return url
      } catch (e) {
        toast.error(`Bannerbear: ${e instanceof Error ? e.message : 'failed'} — using canvas fallback`)
      }
    }

    // Canvas fallback
    const blob = await renderRefurbImage(form, brandColor)
    if (!blob) { toast.error('Image render failed'); return null }
    const file = new File([blob], `refurb_${Date.now()}.jpg`, { type: 'image/jpeg' })
    return await uploadImage(file)
  }

  async function saveDraft() {
    if (!form.brandId) { toast.error('Pick a brand first'); return }
    if (!caption.trim()) { toast.error('Generate or write a caption first'); return }
    setBusy(true)
    try {
      const url = await uploadCurrentImage()
      if (!url) return
      const newPost: Post = {
        id: uid(),
        brand_profile_id: form.brandId,
        image_url: url,
        image_urls: [url],
        caption,
        platforms: ['instagram', 'facebook'],
        status: 'draft',
        scheduled_at: null,
        created_date: new Date().toISOString(),
        client_visible: false,
        client_approved: false,
        aspect_ratio: '4/5',
        category: 'refurb',
      }
      savePosts([newPost, ...posts])
      toast.success('Refurb post saved as draft!')
      router.push('/posts')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally { setBusy(false) }
  }

  async function sendToBuffer() {
    const brand = brands.find(b => b.id === form.brandId)
    if (!brand) { toast.error('Pick a brand first'); return }
    const profileIds = brand.buffer_profile_ids || []
    if (!profileIds.length) { toast.error('Configure Buffer profiles for this brand in Settings'); return }
    if (!caption.trim()) { toast.error('Generate or write a caption first'); return }
    setBusy(true)
    try {
      const url = await uploadCurrentImage()
      if (!url) return
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileIds, text: caption, media: { photo: url } }),
      })
      const data = await res.json()
      const ok = data.success || data.results?.some((r: { success: boolean }) => r.success)
      if (!ok) {
        const err = data.results?.find((r: { error?: string }) => r.error)?.error || data.error || 'Unknown'
        toast.error(`Buffer error: ${err}`); return
      }
      const newPost: Post = {
        id: uid(),
        brand_profile_id: form.brandId,
        image_url: url,
        image_urls: [url],
        caption,
        platforms: ['instagram', 'facebook'],
        status: 'published',
        scheduled_at: null,
        created_date: new Date().toISOString(),
        client_visible: false,
        client_approved: false,
        aspect_ratio: '4/5',
        category: 'refurb',
      }
      savePosts([newPost, ...posts])
      toast.success('Sent to Buffer queue!')
      router.push('/posts')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally { setBusy(false) }
  }

  // Inlined helper (defining a component inside render breaks input focus on every keystroke)
  const renderRows = (section: 'phones' | 'laptops', label: string) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#e6e1e1]">{label}</h3>
        <button onClick={() => addItem(section)} className="btn btn-o btn-sm flex items-center gap-1 text-xs">
          <PlusIcon className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {form[section].map(item => (
          <div key={item.id} className="grid grid-cols-12 gap-2">
            <input className="inp text-sm col-span-6" placeholder="Model + storage (e.g. iPhone 12 Pro 128gb)"
              value={item.model} onChange={e => updateItem(section, item.id, { model: e.target.value })} />
            <input className="inp text-sm col-span-3" placeholder="Colour"
              value={item.variant} onChange={e => updateItem(section, item.id, { variant: e.target.value })} />
            <input className="inp text-sm col-span-2" placeholder="Price"
              value={item.price} onChange={e => updateItem(section, item.id, { price: e.target.value })} />
            <button onClick={() => removeItem(section, item.id)}
              className="col-span-1 text-[#5a4042] hover:text-red-400 flex items-center justify-center">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Refurb Stock</h1>
      <p className="text-[#e1bec0] mb-6">Weekly stock template — coordinate with Daniel, drop in current inventory, generate post.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card p-4">
            <label className="lbl">Brand</label>
            <select className="sel" value={form.brandId} onChange={e => update('brandId', e.target.value)}>
              <option value="">Select a brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-[#e6e1e1]">Quick paste from Daniel</p>
                <p className="text-[11px] text-[#5a4042]">Paste a stock list and we&apos;ll fill the rows automatically.</p>
              </div>
              <button onClick={() => setShowPaste(s => !s)} className="btn btn-o btn-sm flex items-center gap-1 text-xs">
                <ClipboardIcon className="w-3 h-3" /> {showPaste ? 'Hide' : 'Paste'}
              </button>
            </div>
            {showPaste && (
              <div className="space-y-2">
                <textarea className="ta text-sm" rows={6}
                  placeholder={'Phones:\niPhone 12 Pro 128gb [Black] - $465\nSamsung S24 Ultra 256gb [White] - $725\n\nLaptops:\n2020 13" M1 MacBook Pro - $950'}
                  value={pasteText} onChange={e => setPasteText(e.target.value)} />
                <button onClick={parsePaste} className="btn btn-p btn-sm">Parse → Fill rows</button>
              </div>
            )}
          </div>

          {renderRows('phones',  'Instock Phones')}
          {renderRows('laptops', 'Instock Laptops')}

          <div className="card p-4 space-y-3">
            <div>
              <label className="lbl">Warranty / blurb line</label>
              <textarea className="ta text-sm" rows={2} value={form.warrantyLine}
                onChange={e => update('warrantyLine', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="lbl">Store address</label>
                <input className="inp text-sm" value={form.storeAddress}
                  onChange={e => update('storeAddress', e.target.value)} />
              </div>
              <div>
                <label className="lbl">Phone</label>
                <input className="inp text-sm" value={form.storePhone}
                  onChange={e => update('storePhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="lbl">Bannerbear template UID (optional)</label>
              <input className="inp text-sm font-mono" placeholder="Leave blank to use the built-in canvas render"
                value={form.bannerbearTemplateUid}
                onChange={e => update('bannerbearTemplateUid', e.target.value)} />
              <p className="text-[10px] text-[#5a4042] mt-1">
                Template should have layers named: <code>title</code>, <code>phones</code>, <code>laptops</code>, <code>warranty</code>, <code>address</code>, <code>phone</code>, <code>brand_color</code>.
              </p>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="lbl mb-0">Caption</label>
              <button onClick={generateCaption} disabled={generatingCaption || !form.brandId}
                className="btn btn-p btn-sm flex items-center gap-1 text-xs">
                {generatingCaption
                  ? <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Generating...</>
                  : <><SparklesIcon className="w-3 h-3" /> Generate Caption</>}
              </button>
            </div>
            <textarea className="ta text-sm" rows={8} placeholder="Click Generate Caption, or write one manually."
              value={caption} onChange={e => setCaption(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <button onClick={saveDraft} disabled={busy}
              className="btn btn-o flex-1 flex items-center justify-center gap-2">
              <BookmarkIcon className="w-4 h-4" /> Save as Draft
            </button>
            <button onClick={sendToBuffer} disabled={busy}
              className="btn btn-p flex-1 flex items-center justify-center gap-2">
              {busy ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
              Send to Buffer
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <p className="text-sm text-[#e1bec0]">Preview (1080×1350, 4:5)</p>
          <div className="card p-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Refurb stock preview" className="w-full rounded-lg" />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center text-[#5a4042]">Rendering...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
