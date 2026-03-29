'use client'

import { useState } from 'react'
import AutomationsSidebar from './AutomationsSidebar'
import { Bars3Icon } from '@heroicons/react/16/solid'

export default function AutomationsShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <AutomationsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[rgba(14,165,233,0.15)] flex items-center gap-3 px-4 flex-shrink-0">
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[rgba(14,165,233,0.1)] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-500">Automations</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
