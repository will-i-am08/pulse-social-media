'use client'

import { useState, useEffect } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uploadImage } from '@/lib/supabase/storage'
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
  ChevronDownIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/16/solid'

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', w: 1024, h: 1024 },
  { label: 'Landscape (16:9)', w: 1344, h: 768 },
  { label: 'Portrait (4:5)', w: 896, h: 1088 },
  { label: 'Wide (21:9)', w: 1536, h: 640 },
  { label: 'Story (9:16)', w: 768, h: 1344 },
]

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

export default function AIStudioPage() {
  const { brands, saveBrands, photos, savePhotos } = useWorkspace()


  // Training state
  const [trainBrandId, setTrainBrandId] = useState('')
  const [trainingPhotos, setTrainingPhotos] = useState<string[]>([])
  const [triggerWord, setTriggerWord] = useState('')
  const [startingTraining, setStartingTraining] = useState(false)

  // Generation state
  const [genBrandId, setGenBrandId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [aspectIdx, setAspectIdx] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const trainBrand = brands.find(b => b.id === trainBrandId)
  const genBrand = brands.find(b => b.id === genBrandId)
  const trainableBrands = brands
  const generatableBrands = brands.filter(b => b.trainingStatus === 'succeeded' && b.replicateModelVersion)

  // Poll training status
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
          saveBrands(brands.map(b => b.id === trainingBrand.id
            ? { ...b, trainingStatus: 'failed' as const }
            : b
          ))
          toast.error(`Training failed for "${trainingBrand.name}"`)
        }
      } catch { /* keep polling */ }
    }, 30_000)

    return () => clearInterval(interval)
  }, [brands, saveBrands])

  async function startTraining() {
    if (!trainBrandId) return
    if (trainingPhotos.length < 5) { toast.error('Select at least 5 photos'); return }
    if (!triggerWord.trim()) { toast.error('Enter a trigger word'); return }

    const photoUrls = trainingPhotos
      .map(id => photos.find(p => p.id === id)?.url)
      .filter(Boolean)

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
      toast.success('Training started! This takes 15-30 minutes.')
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
    try {
      const aspect = ASPECT_RATIOS[aspectIdx]
      const fullPrompt = `${genBrand.triggerWord || ''} ${prompt}`.trim()

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelVersion: genBrand.replicateModelVersion,
          prompt: fullPrompt,
          width: aspect.w,
          height: aspect.h,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setGeneratedUrl(data.imageUrl)

      // Auto-save to library
      const newPhoto: Photo = {
        id: uid(),
        url: data.imageUrl,
        name: `AI - ${prompt.slice(0, 40)}`,
        tags: ['ai-generated', genBrand.name.toLowerCase()],
        folder_id: null,
        created_date: new Date().toISOString(),
      }
      savePhotos([newPhoto, ...photos])
      toast.success('Image generated and saved to Library!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  function toggleTrainingPhoto(id: string) {
    setTrainingPhotos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e6e1e1] flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-[#f59e0b]" /> AI Studio
        </h1>
        <p className="text-[#9ca3af] text-sm mt-1">Train brand-specific image models and generate on-brand visuals</p>
      </div>

      {/* ── Train a Model ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border p-6" style={{ borderColor: 'rgba(245,158,11,0.15)', background: '#13111a' }}>
        <div className="flex items-center gap-2 mb-4">
          <CpuChipIcon className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-semibold text-[#e6e1e1]">Train a Model</h2>
        </div>

        <div className="space-y-4">
          {/* Brand selector */}
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
              }}
            >
              <option value="">Choose a brand...</option>
              {trainableBrands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
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

              {trainBrand.trainingStatus === 'succeeded' && (
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-300 font-medium">Model ready</p>
                    <p className="text-xs text-emerald-300/70 mt-0.5">
                      Use <code className="text-emerald-300">{trainBrand.triggerWord}</code> in your prompts below to generate brand images.
                    </p>
                  </div>
                </div>
              )}

              {(!trainBrand.trainingStatus || trainBrand.trainingStatus === 'idle' || trainBrand.trainingStatus === 'failed') && (
                <>
                  {trainBrand.trainingStatus === 'failed' && (
                    <p className="text-xs text-red-400 p-2 rounded bg-red-500/5 border border-red-500/20">Previous training failed. Try again with different photos.</p>
                  )}
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">Trigger Word</label>
                    <input
                      className="inp w-full"
                      placeholder="e.g. MYBRANDSTYLE (unique word to activate your style)"
                      value={triggerWord}
                      onChange={e => setTriggerWord(e.target.value)}
                    />
                    <p className="text-[10px] text-[#6b7280] mt-1">Use this word in prompts to generate images in your brand style</p>
                  </div>

                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">
                      Training Photos — {trainingPhotos.length} selected
                      <span className="text-[#6b7280] font-normal ml-1">(min 5, ideally 10-20)</span>
                    </label>
                    {photos.length === 0 ? (
                      <p className="text-xs text-[#6b7280] p-3 rounded-lg bg-white/5 border border-white/10">
                        No photos in library. Upload brand photos in the Library tab first.
                      </p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto p-2 rounded-lg bg-white/5 border border-white/10 grid grid-cols-6 gap-2">
                        {photos.map(photo => {
                          const checked = trainingPhotos.includes(photo.id)
                          return (
                            <button
                              key={photo.id}
                              onClick={() => toggleTrainingPhoto(photo.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                checked ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]' : 'border-transparent hover:border-white/20'
                              }`}
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
                    {startingTraining
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Starting...</>
                      : <><CpuChipIcon className="w-4 h-4" /> Start Training</>
                    }
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Generate Images ────────────────────────────────────────────────── */}
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
            {/* Brand selector */}
            <div>
              <label className="text-xs text-[#9ca3af] mb-1 block">Brand Model</label>
              <select
                className="sel w-full"
                value={genBrandId}
                onChange={e => setGenBrandId(e.target.value)}
              >
                <option value="">Choose a brand...</option>
                {generatableBrands.map(b => (
                  <option key={b.id} value={b.id}>{b.name} — {b.triggerWord}</option>
                ))}
              </select>
            </div>

            {genBrand && (
              <>
                <div>
                  <label className="text-xs text-[#9ca3af] mb-1 block">
                    Prompt <span className="text-[#6b7280]">(trigger word <code className="text-[#fcd34d]">{genBrand.triggerWord}</code> added automatically)</span>
                  </label>
                  <textarea
                    className="ta w-full"
                    rows={3}
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-[#9ca3af] mb-1 block">Aspect Ratio</label>
                  <div className="flex gap-2 flex-wrap">
                    {ASPECT_RATIOS.map((r, i) => (
                      <button
                        key={r.label}
                        onClick={() => setAspectIdx(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          aspectIdx === i
                            ? 'bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/40'
                            : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                        }`}
                      >
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
                  {generating
                    ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating (~30s)...</>
                    : <><SparklesIcon className="w-4 h-4" /> Generate Image</>
                  }
                </button>

                {/* Generated result */}
                {generatedUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[rgba(245,158,11,0.2)]">
                    <img src={generatedUrl} alt="Generated" className="w-full" />
                    <div className="p-3 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.05)' }}>
                      <p className="text-xs text-[#9ca3af]">Saved to Library automatically</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" /> Saved
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ── Replicate Setup Info ───────────────────────────────────────────── */}
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
