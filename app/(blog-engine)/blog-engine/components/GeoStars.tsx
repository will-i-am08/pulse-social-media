'use client'

import { useState } from 'react'
import { GEO_SCORE_CRITERIA } from './utils'

export default function GeoStars({ score, showTooltip = false }: { score: number; showTooltip?: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex items-center gap-0.5"
      title={showTooltip ? undefined : `SEO Score: ${score}/5`}
      onMouseEnter={() => showTooltip && setHovered(true)}
      onMouseLeave={() => showTooltip && setHovered(false)}
    >
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= score ? 'text-amber-400' : 'text-slate-700'}`}>&#9733;</span>
      ))}

      {showTooltip && hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-3 z-50">
          <div className="text-xs font-semibold text-white mb-2">GEO Score Breakdown ({score}/5)</div>
          <div className="space-y-1.5">
            {GEO_SCORE_CRITERIA.map((c, i) => (
              <div key={i} className="text-xs text-slate-400">
                <span className="font-medium text-slate-300">{c.label}:</span> {c.desc}
              </div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1a1a2e] border-r border-b border-white/10 rotate-45" />
        </div>
      )}
    </div>
  )
}
