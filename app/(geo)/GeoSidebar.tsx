'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  GlobeAltIcon,
  ChartBarIcon,
  Squares2X2Icon,
  BoltIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/16/solid'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'SEO',
    items: [
      { id: 'onpage',    label: 'On-Page Checker',   icon: DocumentMagnifyingGlassIcon, href: '/geo/onpage' },
      { id: 'keywords',  label: 'Keyword Research',   icon: MagnifyingGlassIcon,         href: '/geo/keywords' },
      { id: 'technical', label: 'Technical Audit',    icon: WrenchScrewdriverIcon,       href: '/geo/technical' },
    ],
  },
  {
    label: 'AI Visibility',
    items: [
      { id: 'audit',      label: 'AI Audit',         icon: ChartBarIcon,    href: '/geo' },
      { id: 'controller', label: 'Site Controller',   icon: CpuChipIcon,     href: '/geo/controller' },
      { id: 'llms',       label: 'llms.txt Manager',  icon: CodeBracketIcon, href: '/geo/llms' },
      { id: 'schema',     label: 'Schema Injector',   icon: ShieldCheckIcon, href: '/geo/schema' },
      { id: 'commerce',   label: 'Commerce Hub',      icon: BoltIcon,        href: '/geo/commerce' },
    ],
  },
]

interface GeoSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function GeoSidebar({ isOpen, onClose }: GeoSidebarProps) {
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)

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
          w-[236px] min-h-screen bg-[#0d0d14] border-r border-[rgba(99,102,241,0.15)]
          p-4 flex-shrink-0 flex flex-col transition-transform duration-200
          md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-[200]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo + back to hub */}
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
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
            >
              <GlobeAltIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-indigo-400">SEO Center</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto">
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'mt-5' : ''}>
              <div className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-1.5 font-semibold">
                {section.label}
              </div>
              {section.items.map(n => {
                const Icon = n.icon
                const isActive = n.href === '/geo'
                  ? pathname === '/geo'
                  : pathname.startsWith(n.href)
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={onClose}
                    className={`geo-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{n.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}
