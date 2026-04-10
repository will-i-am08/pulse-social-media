'use client'

import { useState } from 'react'
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/16/solid'
import { VARIATION_PRESETS, type VariationPreset } from '@/lib/caption-engine'

interface Props {
  mode: 'auto' | string              // 'auto' or a preset id
  onChange: (mode: 'auto' | string) => void
  selectedPreset?: VariationPreset    // the preset that was actually used (after generation)
  compact?: boolean                   // compact mode for inline use
}

export default function VariationControls({ mode, onChange, selectedPreset, compact }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Auto toggle */}
        <button
          onClick={() => onChange('auto')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors border flex items-center gap-1.5 ${mode === 'auto' ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
        >
          <SparklesIcon className="w-3 h-3" /> Auto-vary
        </button>

        {/* Quick preset picks */}
        {VARIATION_PRESETS.slice(0, 4).map(p => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${mode === p.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
            title={p.description}
          >
            {p.emoji} {p.name}
          </button>
        ))}

        <button
          onClick={() => setShowAll(!showAll)}
          className="px-2 py-1.5 text-xs text-[#e1bec0] hover:text-white transition-colors"
        >
          {showAll ? 'Less' : `+${VARIATION_PRESETS.length - 4} more`}
        </button>

        {showAll && (
          <div className="w-full flex gap-1.5 flex-wrap mt-1">
            {VARIATION_PRESETS.slice(4).map(p => (
              <button
                key={p.id}
                onClick={() => onChange(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${mode === p.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
                title={p.description}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Show which preset was used after generation */}
        {selectedPreset && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            {selectedPreset.emoji} Used: {selectedPreset.name}
          </span>
        )}
      </div>
    )
  }

  // Full expanded view
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#e6e1e1]">Caption Style</h3>
          <p className="text-xs text-[#5a4042]">Choose a structural approach for your caption</p>
        </div>
        <button
          onClick={() => onChange('auto')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors border flex items-center gap-1.5 ${mode === 'auto' ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Auto-rotate
          {mode === 'auto' && <span className="text-[9px] bg-[#ff5473]/20 px-1 rounded">ON</span>}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {VARIATION_PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`text-left px-3 py-2.5 rounded-xl border transition-all ${mode === p.id
              ? 'bg-[rgba(255,84,115,0.1)] border-[#ff5473]/40 ring-1 ring-[#ff5473]/20'
              : 'bg-[rgba(30,15,18,0.3)] border-[rgba(90,64,66,0.3)] hover:border-[rgba(90,64,66,0.6)]'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{p.emoji}</span>
              <span className={`text-xs font-medium ${mode === p.id ? 'text-[#ff5473]' : 'text-[#e6e1e1]'}`}>{p.name}</span>
            </div>
            <p className="text-[10px] text-[#5a4042] leading-tight">{p.description}</p>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-sm">{selectedPreset.emoji}</span>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Last used: {selectedPreset.name}</p>
            <p className="text-[10px] text-emerald-400/60">{selectedPreset.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
