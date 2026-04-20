'use client'

import { useState } from 'react'
import Sidebar from '@/components/app/Sidebar'
import TopBar from '@/components/app/TopBar'
import AgentChat from '@/components/app/AgentChat'
import { BrandProvider } from '@/context/BrandContext'
import type { Role } from '@/lib/types'

export default function AppShell({ children, role }: { children: React.ReactNode; role: Role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrandProvider>
      <div className="flex bg-[#0f0e0e] min-h-screen">
        <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main id="main" className="flex-1 overflow-y-auto min-h-screen">
          <TopBar onMobileMenu={() => setSidebarOpen(true)} />
          {children}
        </main>
        <AgentChat />
      </div>
    </BrandProvider>
  )
}
