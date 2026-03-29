'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { uploadImage } from '@/lib/supabase/storage'
import toast from 'react-hot-toast'
import type { Photo } from '@/lib/types'
import {
  XMarkIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowsPointingOutIcon,
  ScissorsIcon,
} from '@heroicons/react/16/solid'

interface Props {
  photo: Photo
  onSave: (url: string) => void
  onClose: () => void
}

interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  hueRotate: number
}

interface TextOverlay {
  text: string
  x: number
  y: number
  size: number
  color: string
  font: string
}

interface CropArea {
  x: number
  y: number
  w: number
  h: number
}

const FILTERS: { name: string; adj: Partial<Adjustments> }[] = [
  { name: 'Original', adj: {} },
  { name: 'Bright', adj: { brightness: 130, contrast: 110 } },
  { name: 'Moody', adj: { brightness: 90, contrast: 130, saturation: 80 } },
  { name: 'Warm', adj: { hueRotate: -15, saturation: 120, brightness: 105 } },
  { name: 'Cool', adj: { hueRotate: 20, saturation: 90, brightness: 105 } },
  { name: 'B&W', adj: { saturation: 0 } },
  { name: 'Sepia', adj: { saturation: 40, hueRotate: -30, brightness: 105 } },
  { name: 'Vintage', adj: { saturation: 70, contrast: 120, brightness: 95, hueRotate: -10 } },
  { name: 'Vivid', adj: { saturation: 150, contrast: 115, brightness: 105 } },
  { name: 'Fade', adj: { saturation: 60, contrast: 85, brightness: 115 } },
]

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Verdana']
const CROP_RATIOS = [
  { label: 'Free', value: 0 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:5', value: 4 / 5 },
]

const DEFAULT_ADJ: Adjustments = { brightness: 100, contrast: 100, saturation: 100, blur: 0, hueRotate: 0 }

export default function PhotoEditor({ photo, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tab, setTab] = useState<'adjust' | 'filters' | 'crop' | 'text'>('adjust')
  const [adj, setAdj] = useState<Adjustments>({ ...DEFAULT_ADJ })
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  // Crop state
  const [cropping, setCropping] = useState(false)
  const [cropRatio, setCropRatio] = useState(0)
  const [crop, setCrop] = useState<CropArea | null>(null)
  const [cropDragging, setCropDragging] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })

  // Text state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
  const [newText, setNewText] = useState<TextOverlay>({
    text: '', x: 50, y: 50, size: 36, color: '#ffffff', font: 'Arial',
  })

  // History
  const [history, setHistory] = useState<Adjustments[]>([{ ...DEFAULT_ADJ }])
  const [histIdx, setHistIdx] = useState(0)

  function pushHistory(a: Adjustments) {
    const next = [...history.slice(0, histIdx + 1), { ...a }]
    setHistory(next)
    setHistIdx(next.length - 1)
  }

  function undo() {
    if (histIdx > 0) {
      setHistIdx(histIdx - 1)
      setAdj({ ...history[histIdx - 1] })
    }
  }

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setLoaded(true)
    }
    img.onerror = () => toast.error('Failed to load image')
    img.src = photo.url
  }, [photo.url])

  // Build CSS filter string
  function buildFilter(a: Adjustments): string {
    const parts: string[] = []
    if (a.brightness !== 100) parts.push(`brightness(${a.brightness}%)`)
    if (a.contrast !== 100) parts.push(`contrast(${a.contrast}%)`)
    if (a.saturation !== 100) parts.push(`saturate(${a.saturation}%)`)
    if (a.blur > 0) parts.push(`blur(${a.blur}px)`)
    if (a.hueRotate !== 0) parts.push(`hue-rotate(${a.hueRotate}deg)`)
    return parts.join(' ') || 'none'
  }

  // Render preview
  const renderPreview = useCallback(() => {
    const canvas = previewRef.current
    const img = imgRef.current
    if (!canvas || !img || !loaded) return

    const maxW = canvas.parentElement?.clientWidth || 800
    const maxH = canvas.parentElement?.clientHeight || 600
    const scale = Math.min(maxW / img.width, maxH / img.height, 1)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, w, h)
    ctx.save()

    // Rotation & flip
    ctx.translate(w / 2, h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.translate(-w / 2, -h / 2)

    // Filters
    ctx.filter = buildFilter(adj)
    ctx.drawImage(img, 0, 0, w, h)
    ctx.filter = 'none'

    // Text overlays
    for (const t of textOverlays) {
      ctx.font = `${t.size * scale}px ${t.font}`
      ctx.fillStyle = t.color
      ctx.textAlign = 'center'
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = 2
      const tx = (t.x / 100) * w
      const ty = (t.y / 100) * h
      ctx.strokeText(t.text, tx, ty)
      ctx.fillText(t.text, tx, ty)
    }

    ctx.restore()

    // Draw crop overlay
    if (crop && cropping) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h)
      ctx.save()
      // Redraw image in crop area
      ctx.beginPath()
      ctx.rect(crop.x, crop.y, crop.w, crop.h)
      ctx.clip()
      ctx.translate(w / 2, h / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
      ctx.translate(-w / 2, -h / 2)
      ctx.filter = buildFilter(adj)
      ctx.drawImage(img, 0, 0, w, h)
      ctx.filter = 'none'
      for (const t of textOverlays) {
        ctx.font = `${t.size * scale}px ${t.font}`
        ctx.fillStyle = t.color
        ctx.textAlign = 'center'
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.lineWidth = 2
        ctx.strokeText(t.text, (t.x / 100) * w, (t.y / 100) * h)
        ctx.fillText(t.text, (t.x / 100) * w, (t.y / 100) * h)
      }
      ctx.restore()
      // Crop border
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 3])
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h)
      ctx.setLineDash([])
    }
  }, [loaded, adj, rotation, flipH, flipV, textOverlays, crop, cropping])

  useEffect(() => { renderPreview() }, [renderPreview])

  // Crop mouse handlers
  function handleCropMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!cropping || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCropStart({ x, y })
    setCropDragging(true)
    setCrop({ x, y, w: 0, h: 0 })
  }

  function handleCropMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!cropDragging || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    let w = (e.clientX - rect.left) - cropStart.x
    let h = (e.clientY - rect.top) - cropStart.y
    if (cropRatio > 0) {
      h = w / cropRatio
    }
    setCrop({ x: cropStart.x, y: cropStart.y, w, h })
  }

  function handleCropMouseUp() {
    setCropDragging(false)
  }

  // Apply crop
  function applyCrop() {
    if (!crop || !imgRef.current || !previewRef.current) return
    const canvas = previewRef.current
    const img = imgRef.current
    const scaleX = img.width / canvas.width
    const scaleY = img.height / canvas.height

    // Normalize negative dimensions
    const cx = crop.w < 0 ? crop.x + crop.w : crop.x
    const cy = crop.h < 0 ? crop.y + crop.h : crop.y
    const cw = Math.abs(crop.w)
    const ch = Math.abs(crop.h)

    // Create cropped image
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = cw * scaleX
    tempCanvas.height = ch * scaleY
    const ctx = tempCanvas.getContext('2d')!

    ctx.translate(tempCanvas.width / 2, tempCanvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2)
    ctx.filter = buildFilter(adj)
    ctx.drawImage(img, cx * scaleX, cy * scaleY, cw * scaleX, ch * scaleY, 0, 0, tempCanvas.width, tempCanvas.height)

    // Replace source image
    const newImg = new Image()
    newImg.onload = () => {
      imgRef.current = newImg
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setAdj({ ...DEFAULT_ADJ })
      setCrop(null)
      setCropping(false)
      renderPreview()
    }
    newImg.src = tempCanvas.toDataURL('image/png')
  }

  function addTextOverlay() {
    if (!newText.text.trim()) { toast.error('Enter some text'); return }
    setTextOverlays(prev => [...prev, { ...newText }])
    setNewText(t => ({ ...t, text: '' }))
  }

  function removeText(idx: number) {
    setTextOverlays(prev => prev.filter((_, i) => i !== idx))
  }

  // Export & save
  async function handleSave() {
    if (!imgRef.current) return
    setSaving(true)
    try {
      const img = imgRef.current
      const outCanvas = document.createElement('canvas')
      outCanvas.width = img.width
      outCanvas.height = img.height
      const ctx = outCanvas.getContext('2d')!

      ctx.save()
      ctx.translate(img.width / 2, img.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
      ctx.translate(-img.width / 2, -img.height / 2)
      ctx.filter = buildFilter(adj)
      ctx.drawImage(img, 0, 0, img.width, img.height)
      ctx.filter = 'none'

      for (const t of textOverlays) {
        ctx.font = `${t.size}px ${t.font}`
        ctx.fillStyle = t.color
        ctx.textAlign = 'center'
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.lineWidth = 3
        const tx = (t.x / 100) * img.width
        const ty = (t.y / 100) * img.height
        ctx.strokeText(t.text, tx, ty)
        ctx.fillText(t.text, tx, ty)
      }
      ctx.restore()

      const blob = await new Promise<Blob>((resolve, reject) => {
        outCanvas.toBlob(b => b ? resolve(b) : reject(new Error('Export failed')), 'image/png')
      })

      const file = new File([blob], `${photo.name}-edited.png`, { type: 'image/png' })
      const url = await uploadImage(file)
      onSave(url)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const SLIDERS: { key: keyof Adjustments; label: string; min: number; max: number; step: number }[] = [
    { key: 'brightness', label: 'Brightness', min: 20, max: 200, step: 1 },
    { key: 'contrast', label: 'Contrast', min: 20, max: 200, step: 1 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 200, step: 1 },
    { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5 },
    { key: 'hueRotate', label: 'Hue', min: -180, max: 180, step: 1 },
  ]

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
          <span className="text-white font-medium">{photo.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white text-sm flex items-center gap-1.5">
            <ArrowUturnLeftIcon className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={() => { setAdj({ ...DEFAULT_ADJ }); setRotation(0); setFlipH(false); setFlipV(false); setTextOverlays([]) }}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white text-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: '#f59e0b' }}
          >
            {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Save Copy'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {!loaded ? (
            <ArrowPathIcon className="w-8 h-8 animate-spin text-white/40" />
          ) : (
            <canvas
              ref={previewRef}
              className="max-w-full max-h-full"
              style={{ cursor: cropping ? 'crosshair' : 'default' }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right panel */}
        <div className="w-72 flex-shrink-0 border-l border-white/10 flex flex-col overflow-hidden" style={{ background: '#111015' }}>
          {/* Panel tabs */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            {(['adjust', 'filters', 'crop', 'text'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); if (t === 'crop') { setCropping(true) } else { setCropping(false); setCrop(null) } }}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                  tab === t ? 'text-[#fcd34d] border-b-2 border-[#f59e0b]' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Transform controls (always visible) */}
            <div className="flex gap-2">
              <button
                onClick={() => setRotation(r => (r - 90) % 360)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 hover:text-white text-xs flex items-center justify-center gap-1"
              >
                <ArrowPathIcon className="w-3.5 h-3.5 -scale-x-100" /> -90°
              </button>
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 hover:text-white text-xs flex items-center justify-center gap-1"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" /> +90°
              </button>
              <button
                onClick={() => setFlipH(f => !f)}
                className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${flipH ? 'bg-[#f59e0b]/20 text-[#fcd34d]' : 'bg-white/5 text-white/70 hover:text-white'}`}
              >
                <ArrowsPointingOutIcon className="w-3.5 h-3.5" /> Flip H
              </button>
              <button
                onClick={() => setFlipV(f => !f)}
                className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${flipV ? 'bg-[#f59e0b]/20 text-[#fcd34d]' : 'bg-white/5 text-white/70 hover:text-white'}`}
              >
                <ArrowsPointingOutIcon className="w-3.5 h-3.5 rotate-90" /> Flip V
              </button>
            </div>

            {/* Adjust tab */}
            {tab === 'adjust' && (
              <div className="space-y-4">
                {SLIDERS.map(s => (
                  <div key={s.key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-white/60">{s.label}</label>
                      <span className="text-xs text-white/40">{adj[s.key]}{s.key === 'hueRotate' ? '°' : s.key === 'blur' ? 'px' : '%'}</span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={adj[s.key]}
                      onChange={e => {
                        const next = { ...adj, [s.key]: parseFloat(e.target.value) }
                        setAdj(next)
                        pushHistory(next)
                      }}
                      className="w-full accent-[#f59e0b]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Filters tab */}
            {tab === 'filters' && (
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => {
                      const next = { ...DEFAULT_ADJ, ...f.adj }
                      setAdj(next)
                      pushHistory(next)
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-center transition-colors"
                  >
                    <span className="text-xs text-white/80">{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Crop tab */}
            {tab === 'crop' && (
              <div className="space-y-4">
                <p className="text-xs text-white/50">Click and drag on the image to select a crop area.</p>
                <div>
                  <label className="text-xs text-white/60 mb-2 block">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CROP_RATIOS.map(r => (
                      <button
                        key={r.label}
                        onClick={() => setCropRatio(r.value)}
                        className={`py-1.5 rounded-lg text-xs transition-colors ${
                          cropRatio === r.value ? 'bg-[#f59e0b]/20 text-[#fcd34d]' : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                {crop && (crop.w !== 0 || crop.h !== 0) && (
                  <button
                    onClick={applyCrop}
                    className="w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                    style={{ background: '#f59e0b' }}
                  >
                    <ScissorsIcon className="w-4 h-4" /> Apply Crop
                  </button>
                )}
              </div>
            )}

            {/* Text tab */}
            {tab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Text</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#f59e0b]"
                    value={newText.text}
                    onChange={e => setNewText(t => ({ ...t, text: e.target.value }))}
                    placeholder="Type your text..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">X Position (%)</label>
                    <input
                      type="range" min={0} max={100} value={newText.x}
                      onChange={e => setNewText(t => ({ ...t, x: +e.target.value }))}
                      className="w-full accent-[#f59e0b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Y Position (%)</label>
                    <input
                      type="range" min={0} max={100} value={newText.y}
                      onChange={e => setNewText(t => ({ ...t, y: +e.target.value }))}
                      className="w-full accent-[#f59e0b]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Size</label>
                    <input
                      type="range" min={12} max={120} value={newText.size}
                      onChange={e => setNewText(t => ({ ...t, size: +e.target.value }))}
                      className="w-full accent-[#f59e0b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Color</label>
                    <input
                      type="color" value={newText.color}
                      onChange={e => setNewText(t => ({ ...t, color: e.target.value }))}
                      className="w-full h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Font</label>
                  <select
                    value={newText.font}
                    onChange={e => setNewText(t => ({ ...t, font: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  >
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <button
                  onClick={addTextOverlay}
                  className="w-full py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: '#f59e0b' }}
                >
                  Add Text
                </button>

                {textOverlays.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <label className="text-xs text-white/60">Active overlays</label>
                    {textOverlays.map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-white/5">
                        <span className="text-xs text-white/80 truncate" style={{ fontFamily: t.font }}>{t.text}</span>
                        <button onClick={() => removeText(i)} className="text-red-400/60 hover:text-red-400 ml-2">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
