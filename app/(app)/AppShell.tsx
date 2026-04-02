'use client'

import { useState } from 'react'
import Sidebar from '@/components/app/Sidebar'
import AgentChat from '@/components/app/AgentChat'
import type { Role } from '@/lib/types'

export default function AppShell({ children, role }: { children: React.ReactNode; role: Role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex bg-[#0f0e0e] min-h-screen">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main id="main" className="flex-1 overflow-y-auto min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-50 bg-[#141313] border-b border-[rgba(90,64,66,0.2)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#e1bec0] text-xl"
          >
            ☰
          </button>
          <span className="font-bold text-[#ffb2b9]">CaptionCraft</span>
        </div>

        {children}
      </main>
      <AgentChat />
    </div>
  )
}
