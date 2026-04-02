'use client'

import { useState } from 'react'
import BrandResearchSidebar from './BrandResearchSidebar'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import AgentChat from '@/components/app/AgentChat'

export default function BrandResearchShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0f0e0e] flex" style={{ borderTop: '2px solid #8b5cf6' }}>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
        }`}
        style={{ background: '#13111a', borderRight: '1px solid rgba(139,92,246,0.15)' }}
      >
        <BrandResearchSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          sidebarOpen ? 'ml-56' : 'ml-0'
        }`}
      >
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 h-12 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(139,92,246,0.15)', background: '#13111a' }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
          >
            {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
          <span className="text-sm font-semibold text-[#c4b5fd]">Brand Research</span>
          <div className="flex-1" />
          <Link
            href="/account"
            className="text-xs text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
          >
            Account Settings
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <AgentChat />
    </div>
  )
}
