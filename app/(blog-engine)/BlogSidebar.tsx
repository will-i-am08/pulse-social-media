'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  LightBulbIcon,
  PencilSquareIcon,
  PhotoIcon,
  BookOpenIcon,
  Squares2X2Icon,
} from '@heroicons/react/16/solid'
import { useBlog } from '@/context/BlogContext'

const NAV_ITEMS = [
  { id: 'ideas',  label: 'Idea Generator', icon: LightBulbIcon,    tab: 'ideas' },
  { id: 'writer', label: 'Blog Writer',     icon: PencilSquareIcon, tab: 'writer' },
  { id: 'images', label: 'Image Library',   icon: PhotoIcon,        tab: 'images' },
  { id: 'posts',  label: 'Blog Posts',      icon: BookOpenIcon,     tab: 'posts' },
]

interface BlogSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BlogSidebar({ isOpen, onClose, activeTab, onTabChange }: BlogSidebarProps) {
  const { activeBrand } = useBlog()
  const ref = useRef<HTMLElement>(null)
  const primaryColor = activeBrand?.primaryColor || '#0d9488'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[199]" onClick={onClose} />
      )}
      <nav
        ref={ref}
        className={`
          w-[236px] min-h-screen bg-[#0d0d14] border-r p-4 flex-shrink-0 flex flex-col transition-transform duration-200
          md:relative md:translate-x-0 fixed top-0 left-0 h-full z-[200]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ borderColor: `${primaryColor}25` }}
      >
        {/* Logo */}
        <div className="mb-4 px-2 pt-2">
          <Link
            href="/apps"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
          >
            <Squares2X2Icon className="w-3 h-3" /> All Apps
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` }}
            >
              <PencilSquareIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: primaryColor }}>Blog Engine</span>
          </div>
        </div>

        {/* Brand indicator */}
        {activeBrand && (
          <div className="mx-2 mb-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: primaryColor }} />
              <span className="text-xs text-slate-300 font-medium truncate">{activeBrand.name}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(n => {
            const Icon = n.icon
            const isActive = activeTab === n.tab
            return (
              <button
                key={n.id}
                onClick={() => { onTabChange(n.tab); onClose() }}
                className={`blog-nav-item w-full ${isActive ? 'active' : ''}`}
                style={isActive ? {
                  '--blog-primary': primaryColor,
                  background: `${primaryColor}18`,
                  color: primaryColor,
                  borderLeftColor: primaryColor,
                } as React.CSSProperties : {}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{n.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
