'use client'

import { useState, useEffect } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uid } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Photo, Brand } from '@/lib/types'
import {
  SparklesIcon,
  CpuChipIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/16/solid'

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', w: 1024, h: 1024 },
  { label: 'Landscape (16:9)', w: 1344, h: 768 },
  { label: 'Portrait (4:5)', w: 896, h: 1088 },
  { label: 'Wide (21:9)', w: 1536, h: 640 },
  { label: 'Story (9:16)', w: 768, h: 1344 },
]

type Tab = 'brand-model' | 'bannerbear' | 'stock-photos'

function TrainingBadge({ status }: { status?: Brand['trainingStatus'] }) {
  if (!status || status === 'idle') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">Not trained</span>
  if (status === 'training') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex items-center gap-1">
      <ArrowPathIcon className="w-3 h-3 animate-spin" /> Training...
    </span>
  )
  if (status === 'succeeded') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
      <CheckCircleIcon className="w-3 h-3" /> Ready
    </span>
  )
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 flex items-center gap-1">
      <XCircleIcon className="w-3 h-3" /> Failed
    </span>
  )
}

// ── Stock Photos Tab ─────────────────────────────────────────────────────────

const PEXELS_COLORS = [
  { label: 'Black',     value: 'black',     hex: '#1a1a1a' },
  { label: 'White',     value: 'white',     hex: '#f5f5f5' },
  { label: 'Red',       value: 'red',       hex: '#ef4444' },
  { label: 'Orange',    value: 'orange',    hex: '#f97316' },
  { label: 'Yellow',    value: 'yellow',    hex: '#eab308' },
  { label: 'Green',     value: 'green',     hex: '#22c55e' },
  { label: 'Turquoise', value: 'turquoise', hex: '#14b8a6' },
  { label: 'Blue',      value: 'blue',      hex: '#3b82f6' },
  { label: 'Violet',    value: 'violet',    hex: '#8b5cf6' },
  { label: 'Pink',      value: 'pink',      hex: '#ec4899' },
  { label: 'Brown',     value: 'brown',     hex: '#92400e' },
]

const PEXELS_STYLES = [
  { label: 'Any',           keywords: '' },
  { label: 'Minimal',       keywords: 'minimal clean simple' },
  { label: 'Vibrant',       keywords: 'vibrant colorful bright' },
  { label: 'Dark & Moody',  keywords: 'dark moody dramatic' },
  { label: 'Natural',       keywords: 'natural organic soft light' },
  { label: 'Abstract',      keywords: 'abstract artistic texture' },
]

const QUICK_CATEGORIES = ['Business', 'People', 'Nature', 'Technology', 'Food', 'Architecture', 'Travel']

interface PexelsPhoto {
  id: number
  thumbUrl: string
  fullUrl: string
  photographer: string
  alt: string
  width: number
  height: number
}

function StockPhotosTab({ photos, savePhotos }: { photos: Photo[]; savePhotos: (v: Photo[]) => void }) {
  const [query, setQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [results, setResults] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(0)
  const [adding, setAdding] = useState<Set<number>>(new Set())
  const [added, setAdded] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  async function doSearch(q: string, pg: number, color: string, styleIdx: number, append = false) {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const styleKw = PEXELS_STYLES[styleIdx]?.keywords || ''
      const fullQuery = styleKw ? `${q} ${styleKw}` : q
      const params = new URLSearchParams({ q: fullQuery, page: String(pg), per_page: '20' })
      if (color) params.set('color', color)
      const res = await fetch(`/api/stock-photos?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Search failed'); return }
      setResults(prev => append ? [...prev, ...data.photos] : data.photos)
      setTotalResults(data.totalResults)
      setPage(pg)
      setHasSearched(true)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    const q = inputValue.trim()
    if (!q) return
    setQuery(q)
    setAdded(new Set())
    doSearch(q, 1, selectedColor, selectedStyle, false)
  }

  function handleCategory(cat: string) {
    setInputValue(cat)
    setQuery(cat)
    setAdded(new Set())
    doSearch(cat, 1, selectedColor, selectedStyle, false)
  }

  function handleColorChange(color: string) {
    const next = color === selectedColor ? '' : color
    setSelectedColor(next)
    if (query) doSearch(query, 1, next, selectedStyle, false)
  }

  function handleStyleChange(idx: number) {
    setSelectedStyle(idx)
    if (query) doSearch(query, 1, selectedColor, idx, false)
  }

  function loadMore() {
    doSearch(query, page + 1, selectedColor, selectedStyle, true)
  }

  async function addToLibrary(photo: PexelsPhoto) {
    setAdding(prev => new Set(prev).add(photo.id))
    try {
      const res = await fetch('/api/stock-photos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photo.fullUrl, name: photo.alt || 'Stock photo' }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to save photo'); return }
      const newPhoto: Photo = {
        id: uid(),
        url: data.publicUrl,
        name: photo.alt || 'Stock photo',
        tags: ['stock', 'pexels'],
        folder_id: null,
        created_date: new Date().toISOString(),
      }
      savePhotos([newPhoto, ...photos])
      setAdded(prev => new Set(prev).add(photo.id))
      toast.success('Added to library!')
    } catch {
      toast.error('Failed to save photo')
    } finally {
      setAdding(prev => { const s = new Set(prev); s.delete(photo.id); return s })
    }
  }

  const hasMore = results.length < totalResults

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            className="inp w-full pl-9"
            placeholder="Describe the photo you need..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !inputValue.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
          style={{ background: '#f59e0b' }}
        >
          {loading && !results.length ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <MagnifyingGlassIcon className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Quick categories */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              query === cat
                ? 'bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/40'
                : 'bg-white/5 text-[#9ca3af] hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(245,158,11,0.1)', background: '#13111a' }}>
        {/* Color swatches */}
        <div>
          <p className="text-[10px] text-[#6b7280] mb-2 uppercase tracking-wider">Color</p>
          <div className="flex flex-wrap gap-2">
            {PEXELS_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => handleColorChange(c.value)}
                title={c.label}
                className={`w-6 h-6 rounded-full transition-all ${selectedColor === c.value ? 'ring-2 ring-offset-2 ring-[#f59e0b] ring-offset-[#13111a] scale-110' : 'hover:scale-110'}`}
                style={{ background: c.hex, border: c.value === 'white' ? '1px solid rgba(255,255,255,0.2)' : undefined }}
              />
            ))}
            {selectedColor && (
              <button
                onClick={() => handleColorChange('')}
                className="px-2 py-0.5 rounded-full text-[10px] text-[#6b7280] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Style selector */}
        <div>
          <p className="text-[10px] text-[#6b7280] mb-2 uppercase tracking-wider">Style</p>
          <div className="flex flex-wrap gap-2">
            {PEXELS_STYLES.map((s, i) => (
              <button
                key={s.label}
                onClick={() => handleStyleChange(i)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  selectedStyle === i
                    ? 'bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/40'
                    : 'bg-white/5 text-[#6b7280] hover:text-white border border-transparent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">{error}</div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div>
          <p className="text-xs text-[#6b7280] mb-3">{totalResults.toLocaleString()} results</p>
          <div className="grid grid-cols-3 gap-3">
            {results.map(photo => {
              const isAdding = adding.has(photo.id)
              const isAdded = added.has(photo.id)
              return (
                <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.thumbUrl}
                      alt={photo.alt || 'Stock photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-[#6b7280] truncate mb-1.5">by {photo.photographer}</p>
                    <button
                      onClick={() => !isAdded && !isAdding && addToLibrary(photo)}
                      disabled={isAdding || isAdded}
                      className={`w-full py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
                        isAdded
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#f59e0b]/15 text-[#fcd34d] hover:bg-[#f59e0b]/25 border border-[#f59e0b]/20 disabled:opacity-50'
                      }`}
                    >
                      {isAdding ? (
                        <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Saving...</>
                      ) : isAdded ? (
                        <><CheckCircleIcon className="w-3 h-3" /> Added</>
                      ) : (
                        <>+ Add to Library</>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-[#9ca3af] hover:text-white transition-colors disabled:opacity-40 flex items-center gap-2 mx-auto"
              >
                {loading ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Loading...</> : `Load more (page ${page + 1})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {hasSearched && results.length === 0 && !loading && (
        <div className="text-center py-10 text-[#6b7280]">
          <PhotoIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No photos found</p>
          <p className="text-xs mt-1">Try a different search term or remove filters</p>
        </div>
      )}

      {/* Pexels attribution */}
      <p className="text-[10px] text-[#4b5563] text-center">
        Photos provided by{' '}
        <span className="text-[#6b7280]">Pexels</span>
        {' '}— free to use, no attribution required
      </p>
    </div>
  )
}

// ── Bannerbear Tab ────────────────────────────────────────────────────────────
interface BannerbearTemplate {
  uid: string
  name: string
  preview_url?: string
  available_modifications?: Array<{ name: string; text?: string }>
}

function BannerbearTab({ photos, savePhotos }: { photos: Photo[]; savePhotos: (v: Photo[]) => void }) {
  const [templates, setTemplates] = useState<BannerbearTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [selectedUid, setSelectedUid] = useState('')
  const [modifications, setModifications] = useState<Record<string, string>>({})
  const [rendering, setRendering] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bannerbear')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setTemplateError(data.error); return }
        setTemplates(data.templates || [])
      })
      .catch(() => setTemplateError('Failed to load templates'))
      .finally(() => setLoadingTemplates(false))
  }, [])

  const selectedTemplate = templates.find(t => t.uid === selectedUid)

  function handleModChange(name: string, value: string) {
    setModifications(prev => ({ ...prev, [name]: value }))
  }

  async function render() {
    if (!selectedUid) { toast.error('Select a template'); return }
    setRendering(true)
    setResult(null)
    try {
      const mods = Object.entries(modifications)
        .filter(([, v]) => v.trim())
        .map(([name, text]) => ({ name, text }))

      const res = await fetch('/api/bannerbear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_uid: selectedUid, modifications: mods }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Render failed'); return }
      setResult(data.imageUrl)
      const newPhoto: Photo = {
        id: uid(),
        url: data.imageUrl,
        name: `Bannerbear - ${selectedTemplate?.name || selectedUid}`,
        tags: ['ai-generated', 'bannerbear'],
        folder_id: null,
        created_date: new Date().toISOString(),
      }
      savePhotos([newPhoto, ...photos])
      toast.success('Image rendered and saved to Library!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Render failed')
    } finally {
      setRendering(false)
    }
  }

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="w-5 h-5 animate-spin text-[#f59e0b]" />
        <span className="ml-2 text-sm text-[#9ca3af]">Loading templates...</span>
      </div>
    )
  }

  if (templateError) {
    return (
      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">
        {templateError}
        {templateError.includes('not configured') && (
          <p className="mt-2 text-[#9ca3af]">Add your Bannerbear API key in <a href="/account" className="text-[#fcd34d] hover:underline">Account Settings</a>.</p>
        )}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-[#6b7280]">
        <PhotoIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No templates found</p>
        <p className="text-xs mt-1">Create templates in your Bannerbear account first</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#9ca3af] mb-1 block">Template</label>
        <select
          className="sel w-full"
          value={selectedUid}
          onChange={e => { setSelectedUid(e.target.value); setModifications({}); setResult(null) }}
        >
          <option value="">Choose a template...</option>
          {templates.map(t => (
            <option key={t.uid} value={t.uid}>{t.name}</option>
          ))}
        </select>
      </div>

      {selectedTemplate?.preview_url && (
        <div className="rounded-lg overflow-hidden border border-white/10">
          <img src={selectedTemplate.preview_url} alt="Template preview" className="w-full" />
          <p className="text-[10px] text-[#6b7280] p-2 text-center">Template preview</p>
        </div>
      )}

      {selectedTemplate && selectedTemplate.available_modifications && selectedTemplate.available_modifications.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs text-[#9ca3af] block">Modifications</label>
          {selectedTemplate.available_modifications.map(mod => (
            <div key={mod.name}>
              <label className="text-[10px] text-[#6b7280] mb-0.5 block capitalize">{mod.name.replace(/_/g, ' ')}</label>
              <input
                className="inp w-full"
                placeholder={mod.text || `Enter ${mod.name}...`}
                value={modifications[mod.name] || ''}
                onChange={e => handleModChange(mod.name, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <button
          onClick={render}
          disabled={rendering || !selectedUid}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: '#f59e0b' }}
        >
          {rendering
            ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Rendering...</>
            : <><PhotoIcon className="w-4 h-4" /> Render Image</>
          }
        </button>
      )}

      {result && (
        <div className="mt-4 rounded-xl overflow-hidden border border-[rgba(245,158,11,0.2)]">
          <img src={result} alt="Rendered" className="w-full" />
          <div className="p-3 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <p className="text-xs text-[#9ca3af]">Saved to Library automatically</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" /> Saved
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Brand Model Tab (existing Replicate content) ───────────────────────────────
function BrandModelTab({ brands, saveBrands, photos, savePhotos }: { brands: Brand[]; saveBrands: (v: Brand[]) => void; photos: Photo[]; savePhotos: (v: Photo[]) => void }) {
  const [trainBrandId, setTrainBrandId] = useState('')
  const [trainingPhotos, setTrainingPhotos] = useState<string[]>([])
  const [triggerWord, setTriggerWord] = useState('')
  const [startingTraining, setStartingTraining] = useState(false)
  const [retraining, setRetraining] = useState(false)

  const [genBrandId, setGenBrandId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [aspectIdx, setAspectIdx] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [predictionId, setPredictionId] = useState<string | null>(null)

  const trainBrand = brands.find(b => b.id === trainBrandId)
  const genBrand = brands.find(b => b.id === genBrandId)
  const generatableBrands = brands.filter(b => b.trainingStatus === 'succeeded' && b.replicateModelVersion)

  useEffect(() => {
    const trainingBrand = brands.find(b => b.trainingStatus === 'training' && b.trainingId)
    if (!trainingBrand) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/training-status?trainingId=${trainingBrand.trainingId}`)
        const data = await res.json()
        if (data.status === 'succeeded' && data.modelVersion) {
          saveBrands(brands.map(b => b.id === trainingBrand.id
            ? { ...b, trainingStatus: 'succeeded' as const, replicateModelVersion: data.modelVersion }
            : b
          ))
          toast.success(`Model for "${trainingBrand.name}" is ready!`)
        } else if (data.status === 'failed' || data.status === 'canceled') {
          saveBrands(brands.map(b => b.id === trainingBrand.id ? { ...b, trainingStatus: 'failed' as const } : b))
          toast.error(`Training failed for "${trainingBrand.name}"`)
        }
      } catch { /* keep polling */ }
    }, 30_000)
    return () => clearInterval(interval)
  }, [brands, saveBrands])

  useEffect(() => {
    if (!predictionId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate-image?id=${predictionId}`)
        const data = await res.json()
        if (data.status === 'succeeded' && data.imageUrl) {
          clearInterval(interval)
          setPredictionId(null)
          setGenerating(false)
          setGeneratedUrl(data.imageUrl)
          const newPhoto: Photo = {
            id: uid(),
            url: data.imageUrl,
            name: `AI - ${prompt.slice(0, 40)}`,
            tags: ['ai-generated', genBrand?.name?.toLowerCase() || 'ai'],
            folder_id: null,
            created_date: new Date().toISOString(),
          }
          savePhotos([newPhoto, ...photos])
          toast.success('Image generated and saved to Library!')
        } else if (data.status === 'failed' || data.status === 'canceled') {
          clearInterval(interval)
          setPredictionId(null)
          setGenerating(false)
          toast.error(data.error || 'Generation failed')
        }
      } catch { /* keep polling */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [predictionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function startTraining() {
    if (!trainBrandId) return
    if (trainingPhotos.length < 5) { toast.error('Select at least 5 photos'); return }
    if (!triggerWord.trim()) { toast.error('Enter a trigger word'); return }
    const photoUrls = trainingPhotos.map(id => photos.find(p => p.id === id)?.url).filter(Boolean)
    setStartingTraining(true)
    try {
      const res = await fetch('/api/train-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls, triggerWord: triggerWord.trim(), brandId: trainBrandId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to start training'); return }
      saveBrands(brands.map(b => b.id === trainBrandId
        ? { ...b, trainingStatus: 'training' as const, trainingId: data.trainingId, triggerWord: triggerWord.trim() }
        : b
      ))
      setRetraining(false)
      toast.success('Training started! This takes 1-2 hours.')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Training failed')
    } finally {
      setStartingTraining(false)
    }
  }

  async function generateImage() {
    if (!genBrand?.replicateModelVersion) return
    if (!prompt.trim()) { toast.error('Enter a prompt'); return }
    setGenerating(true)
    setGeneratedUrl(null)
    setPredictionId(null)
    try {
      const aspect = ASPECT_RATIOS[aspectIdx]
      const fullPrompt = `${genBrand.triggerWord || ''} ${prompt}`.trim()
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelVersion: genBrand.replicateModelVersion, prompt: fullPrompt, width: aspect.w, height: aspect.h }),
      })
      const data = await res.json()
      if (!res.ok) { setGenerating(false); toast.error(data.error || 'Generation failed'); return }
      setPredictionId(data.predictionId)
    } catch (e: unknown) {
      setGenerating(false)
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    }
  }

  function toggleTrainingPhoto(id: string) {
    setTrainingPhotos(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <div className="space-y-8">
      {/* Train a Model */}
      <section className="rounded-2xl border p-6" style={{ borderColor: 'rgba(245,158,11,0.15)', background: '#13111a' }}>
        <div className="flex items-center gap-2 mb-4">
          <CpuChipIcon className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-semibold text-[#e6e1e1]">Train a Model</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9ca3af] mb-1 block">Select Brand</label>
            <select
              className="sel w-full"
              value={trainBrandId}
              onChange={e => {
                setTrainBrandId(e.target.value)
                const b = brands.find(x => x.id === e.target.value)
                setTriggerWord(b?.triggerWord || '')
                setTrainingPhotos([])
                setRetraining(false)
              }}
            >
              <option value="">Choose a brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {trainBrand && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: trainBrand.color || '#f59e0b' }}>
                  {trainBrand.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#e6e1e1] font-medium">{trainBrand.name}</p>
                  <p className="text-xs text-[#9ca3af]">{trainBrand.tone} · {trainBrand.output_length}</p>
                </div>
                <TrainingBadge status={trainBrand.trainingStatus} />
              </div>

              {trainBrand.trainingStatus === 'training' && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                  <ArrowPathIcon className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-300 font-medium">Training in progress</p>
                    <p className="text-xs text-amber-300/70 mt-0.5">This takes 15-30 minutes. You can close this page and come back.</p>
                    {trainBrand.triggerWord && <p className="text-xs text-amber-300/50 mt-1">Trigger: <code className="text-amber-300">{trainBrand.triggerWord}</code></p>}
                  </div>
                </div>
              )}

              {trainBrand.trainingStatus === 'succeeded' && !retraining && (
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-emerald-300 font-medium">Model ready</p>
                    <p className="text-xs text-emerald-300/70 mt-0.5">
                      Use <code className="text-emerald-300">{trainBrand.triggerWord}</code> in your prompts below.
                    </p>
                  </div>
                  <button onClick={() => setRetraining(true)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0">Retrain</button>
                </div>
              )}

              {(!trainBrand.trainingStatus || trainBrand.trainingStatus === 'idle' || trainBrand.trainingStatus === 'failed' || retraining) && (
                <>
                  {trainBrand.trainingStatus === 'failed' && (
                    <p className="text-xs text-red-400 p-2 rounded bg-red-500/5 border border-red-500/20">Previous training failed. Try again with different photos.</p>
                  )}
                  {retraining && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <p className="text-xs text-amber-300">This will replace the existing model for this brand.</p>
                      <button onClick={() => setRetraining(false)} className="text-xs text-amber-300/60 hover:text-amber-300 ml-3">Cancel</button>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">Trigger Word</label>
                    <input className="inp w-full" placeholder="e.g. MYBRANDSTYLE" value={triggerWord} onChange={e => setTriggerWord(e.target.value)} />
                    <p className="text-[10px] text-[#6b7280] mt-1">Use this word in prompts to generate images in your brand style</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">Training Photos — {trainingPhotos.length} selected <span className="text-[#6b7280] font-normal">(min 5, ideally 10-20)</span></label>
                    {photos.length === 0 ? (
                      <p className="text-xs text-[#6b7280] p-3 rounded-lg bg-white/5 border border-white/10">No photos in library. Upload brand photos in the Library tab first.</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto p-2 rounded-lg bg-white/5 border border-white/10 grid grid-cols-6 gap-2">
                        {photos.map(photo => {
                          const checked = trainingPhotos.includes(photo.id)
                          return (
                            <button
                              key={photo.id}
                              onClick={() => toggleTrainingPhoto(photo.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${checked ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]' : 'border-transparent hover:border-white/20'}`}
                            >
                              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                              {checked && (
                                <div className="absolute inset-0 bg-[#f59e0b]/20 flex items-center justify-center">
                                  <CheckCircleIcon className="w-5 h-5 text-[#f59e0b]" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={startTraining}
                    disabled={startingTraining || trainingPhotos.length < 5 || !triggerWord.trim()}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: '#f59e0b' }}
                  >
                    {startingTraining ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Starting...</> : <><CpuChipIcon className="w-4 h-4" /> Start Training</>}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Generate Images */}
      <section className="rounded-2xl border p-6" style={{ borderColor: 'rgba(245,158,11,0.15)', background: '#13111a' }}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-semibold text-[#e6e1e1]">Generate Images</h2>
        </div>
        {generatableBrands.length === 0 ? (
          <div className="text-center py-8 text-[#6b7280]">
            <CpuChipIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No trained models yet</p>
            <p className="text-xs mt-1">Train a brand model above to start generating images</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#9ca3af] mb-1 block">Brand Model</label>
              <select className="sel w-full" value={genBrandId} onChange={e => setGenBrandId(e.target.value)}>
                <option value="">Choose a brand...</option>
                {generatableBrands.map(b => <option key={b.id} value={b.id}>{b.name} — {b.triggerWord}</option>)}
              </select>
            </div>
            {genBrand && (
              <>
                <div>
                  <label className="text-xs text-[#9ca3af] mb-1 block">
                    Prompt <span className="text-[#6b7280]">(trigger word <code className="text-[#fcd34d]">{genBrand.triggerWord}</code> added automatically)</span>
                  </label>
                  <textarea className="ta w-full" rows={3} placeholder="Describe the image..." value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#9ca3af] mb-1 block">Aspect Ratio</label>
                  <div className="flex gap-2 flex-wrap">
                    {ASPECT_RATIOS.map((r, i) => (
                      <button key={r.label} onClick={() => setAspectIdx(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${aspectIdx === i ? 'bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/40' : 'bg-white/5 text-white/60 hover:text-white border border-transparent'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={generateImage}
                  disabled={generating || !prompt.trim()}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: '#f59e0b' }}
                >
                  {generating ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating (~30s)...</> : <><SparklesIcon className="w-4 h-4" /> Generate Image</>}
                </button>
                {generatedUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[rgba(245,158,11,0.2)]">
                    <img src={generatedUrl} alt="Generated" className="w-full" />
                    <div className="p-3 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.05)' }}>
                      <p className="text-xs text-[#9ca3af]">Saved to Library automatically</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Saved</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Replicate Setup */}
      <section className="rounded-2xl border p-5" style={{ borderColor: 'rgba(245,158,11,0.1)', background: '#13111a' }}>
        <p className="text-xs text-[#9ca3af] font-medium mb-2">Replicate API Setup</p>
        <ol className="list-decimal list-inside space-y-1 text-[#6b7280] text-xs">
          <li>Create an account at <span className="text-[#fcd34d]">replicate.com</span></li>
          <li>Go to <span className="font-mono text-[#fcd34d]">replicate.com/account/api-tokens</span> and create a token</li>
          <li>Add to your <span className="font-mono text-[#fcd34d]">.env.local</span>:</li>
        </ol>
        <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs text-[#fcd34d] select-all">
          REPLICATE_API_KEY=r8_your_token_here
        </div>
      </section>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AIStudioPage() {
  const { brands, saveBrands, photos, savePhotos } = useWorkspace()
  const [tab, setTab] = useState<Tab>('brand-model')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'brand-model', label: 'Brand Model' },
    { id: 'bannerbear', label: 'Bannerbear' },
    { id: 'stock-photos', label: 'Stock Photos' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e6e1e1] flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-[#f59e0b]" /> AI Studio
        </h1>
        <p className="text-[#9ca3af] text-sm mt-1">Generate on-brand marketing visuals with multiple AI engines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#13111a', border: '1px solid rgba(245,158,11,0.1)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'text-[#fcd34d]'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
            style={tab === t.id ? { background: 'rgba(245,158,11,0.15)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'brand-model' && (
        <BrandModelTab brands={brands} saveBrands={saveBrands} photos={photos} savePhotos={savePhotos} />
      )}
      {tab === 'bannerbear' && (
        <section className="rounded-2xl border p-6" style={{ borderColor: 'rgba(245,158,11,0.15)', background: '#13111a' }}>
          <BannerbearTab photos={photos} savePhotos={savePhotos} />
        </section>
      )}
      {tab === 'stock-photos' && (
        <section className="rounded-2xl border p-6" style={{ borderColor: 'rgba(245,158,11,0.15)', background: '#13111a' }}>
          <div className="flex items-center gap-2 mb-5">
            <MagnifyingGlassIcon className="w-5 h-5 text-[#f59e0b]" />
            <h2 className="font-semibold text-[#e6e1e1]">Stock Photos</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#fcd34d]">Pexels</span>
          </div>
          <StockPhotosTab photos={photos} savePhotos={savePhotos} />
        </section>
      )}
    </div>
  )
}
