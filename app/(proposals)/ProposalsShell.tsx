'use client'

import { useState } from 'react'
import ProposalsSidebar from './ProposalsSidebar'
import { Bars3Icon } from '@heroicons/react/16/solid'
import AgentChat from '@/components/app/AgentChat'

export default function ProposalsShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <ProposalsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[rgba(16,185,129,0.15)] flex items-center gap-3 px-4 flex-shrink-0 print:hidden">
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[rgba(16,185,129,0.1)] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-500">Proposals & Contracts</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <AgentChat />
    </div>
  )
}
