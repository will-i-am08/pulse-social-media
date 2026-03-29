'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { HOLIDAYS_2026, type Holiday } from '@/lib/holidays'
import { callClaude } from '@/lib/claude'
import { useRouter } from 'next/navigation'
import { SparklesIcon, ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid'

interface HolidayCaption {
  [key: string]: string
}

export default function HolidaysPage() {
  const { brands } = useWorkspace()
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState('')
  const [captions, setCaptions] = useState<HolidayCaption>({})
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)

  const brand = brands.find(b => b.id === selectedBrand)

  async function generateCaption(holiday: Holiday) {
    if (!brand) { toast.error('Select a brand first'); return }
    setGenerating(holiday.name)
    const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations.'
    const prompt = `Write a ${brand.output_length || 'medium'} social media caption for ${holiday.name} (${holiday.date}) for the brand "${brand.name}".
Tone: ${brand.tone || 'professional'}
Guidelines: ${brand.brand_guidelines || 'N/A'}
${brand.include_hashtags !== false ? 'Include relevant holiday hashtags.' : 'No hashtags.'}
${brand.include_emojis !== false ? 'Use appropriate holiday emojis.' : 'No emojis.'}`
    const result = await callClaude(sys, prompt, 400)
    if (result) {
      setCaptions(prev => ({ ...prev, [holiday.name]: result }))
    }
    setGenerating(null)
  }

  async function generateAll() {
    if (!brand) { toast.error('Select a brand first'); return }
    setGeneratingAll(true)
    const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations.'
    for (const holiday of HOLIDAYS_2026) {
      if (captions[holiday.name]) continue
      setGenerating(holiday.name)
      const prompt = `Write a ${brand.output_length || 'medium'} social media caption for ${holiday.name} (${holiday.date}) for the brand "${brand.name}".
Tone: ${brand.tone || 'professional'}
Guidelines: ${brand.brand_guidelines || 'N/A'}
${brand.include_hashtags !== false ? 'Include relevant holiday hashtags.' : 'No hashtags.'}
${brand.include_emojis !== false ? 'Use appropriate holiday emojis.' : 'No emojis.'}`
      const result = await callClaude(sys, prompt, 400)
      if (result) setCaptions(prev => ({ ...prev, [holiday.name]: result }))
    }
    setGenerating(null)
    setGeneratingAll(false)
    toast.success('All holiday captions generated!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Holidays 2026</h1>
          <p className="text-[#e1bec0] mt-1">Generate AI captions for upcoming holidays</p>
        </div>
      </div>

      {/* Brand selector */}
      <div className="card p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="lbl">Brand</label>
            <select className="sel" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
              <option value="">Select a brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button
            className="btn btn-p flex items-center gap-2"
            disabled={!selectedBrand || generatingAll}
            onClick={generateAll}
          >
            {generatingAll
              ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating...</>
              : <><SparklesIcon className="w-4 h-4" /> Generate All</>
            }
          </button>
        </div>
      </div>

      {/* Holidays list */}
      <div className="space-y-3">
        {HOLIDAYS_2026.map(holiday => (
          <div key={holiday.name} className="card p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-center min-w-[64px]">
                <p className="text-sm font-bold text-[#e1bec0]">{new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#e6e1e1]">{holiday.name}</h3>
                </div>
                {captions[holiday.name] ? (
                  <div>
                    <textarea
                      className="ta text-sm"
                      rows={3}
                      value={captions[holiday.name]}
                      onChange={e => setCaptions(prev => ({ ...prev, [holiday.name]: e.target.value }))}
                    />
                    <button
                      className="btn btn-o btn-sm mt-2 flex items-center gap-1"
                      onClick={() => { navigator.clipboard.writeText(captions[holiday.name]); toast.success('Copied!') }}
                    >
                      <ClipboardDocumentIcon className="w-3 h-3" /> Copy
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-[#5a4042] italic">No caption generated yet</p>
                )}
              </div>
              <button
                className="btn btn-o btn-sm flex-shrink-0 flex items-center gap-1"
                disabled={!selectedBrand || generating === holiday.name}
                onClick={() => generateCaption(holiday)}
              >
                {generating === holiday.name
                  ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  : <SparklesIcon className="w-3 h-3" />
                }
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
