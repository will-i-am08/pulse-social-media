'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  DocumentTextIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/16/solid'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',      icon: Squares2X2Icon,       href: '/proposals' },
  { id: 'list',       label: 'All Documents',   icon: ListBulletIcon,       href: '/proposals/list' },
  { id: 'create',     label: 'Create New',      icon: PlusCircleIcon,       href: '/proposals/create' },
  { id: 'templates',  label: 'Templates',       icon: DocumentDuplicateIcon, href: '/proposals/templates' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ProposalsSidebar({ isOpen, onClose }: Props) {
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
        <div className="md:hidden fixed inset-0 bg-black/50 z-[199] print:hidden" onClick={onClose} />
      )}
      <nav
        ref={ref}
        className={`
          w-[236px] min-h-screen bg-[#0d0d14] border-r border-[rgba(16,185,129,0.15)]
          p-4 flex-shrink-0 flex flex-col transition-transform duration-200
          md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-[200] print:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
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
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
            >
              <DocumentTextIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-emerald-400">Proposals</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {NAV_ITEMS.map(n => {
            const Icon = n.icon
            const isActive = n.href === '/proposals'
              ? pathname === '/proposals'
              : pathname.startsWith(n.href)
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={onClose}
                className={`prop-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{n.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
