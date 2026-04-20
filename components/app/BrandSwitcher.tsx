'use client'

import { useEffect, useRef, useState } from 'react'
import { useActiveBrand } from '@/context/BrandContext'
import { ChevronDownIcon, CheckIcon, Squares2X2Icon } from '@heroicons/react/16/solid'

export default function BrandSwitcher() {
  const { brands, activeBrand, activeBrandId, setActiveBrandId } = useActiveBrand()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const label = activeBrand?.name || 'All brands'
  const colour = activeBrand?.color || '#ff5473'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="brand-switcher"
      >
        {activeBrand ? (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: colour }}
          >
            {activeBrand.name[0].toUpperCase()}
          </span>
        ) : (
          <Squares2X2Icon className="w-4 h-4 text-[#e1bec0]" />
        )}
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDownIcon className={`w-3.5 h-3.5 text-[#e1bec0] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-[260px] bg-[#1c1b1b] border border-[rgba(90,64,66,0.4)] rounded-xl shadow-2xl z-[150] overflow-hidden"
        >
          <div className="max-h-[60vh] overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => { setActiveBrandId(null); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[rgba(255,84,115,0.08)] transition-colors text-left"
            >
              <Squares2X2Icon className="w-4 h-4 text-[#e1bec0]" />
              <span className="flex-1 text-sm text-[#e6e1e1]">All brands</span>
              {activeBrandId === null && <CheckIcon className="w-4 h-4 text-[#ff5473]" />}
            </button>
            {brands.length > 0 && <div className="h-px bg-[rgba(90,64,66,0.2)] my-1" />}
            {brands.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => { setActiveBrandId(b.id); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[rgba(255,84,115,0.08)] transition-colors text-left"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: b.color || '#ff5473' }}
                >
                  {(b.name || '?')[0].toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-[#e6e1e1] truncate">{b.name}</span>
                  <span className="block text-[10px] text-[#5a4042] truncate">{b.tone || 'professional'} · {b.output_length || 'medium'}</span>
                </span>
                {activeBrandId === b.id && <CheckIcon className="w-4 h-4 text-[#ff5473]" />}
              </button>
            ))}
            {brands.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[#5a4042]">
                No brands yet. <a href="/brands" className="text-[#ffb2b9] underline">Create one</a>.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
