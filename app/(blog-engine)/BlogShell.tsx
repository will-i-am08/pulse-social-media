'use client'

import { useState, createContext, useContext } from 'react'
import { Bars3Icon } from '@heroicons/react/16/solid'
import BlogSidebar from './BlogSidebar'
import { BlogProvider } from '@/context/BlogContext'

// Tab context so child pages can read/set the active tab
interface TabCtx { activeTab: string; setActiveTab: (t: string) => void }
const TabContext = createContext<TabCtx>({ activeTab: 'ideas', setActiveTab: () => {} })
export const useTab = () => useContext(TabContext)

interface BlogShellProps {
  userId: string
  children: React.ReactNode
}

export default function BlogShell({ userId: _userId, children }: BlogShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ideas')

  return (
    <BlogProvider>
      <TabContext.Provider value={{ activeTab, setActiveTab }}>
        <div className="flex min-h-screen bg-[#0a0a0f]">
          <BlogSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 border-b border-[rgba(13,148,136,0.15)] flex items-center gap-3 px-4 flex-shrink-0">
              <button
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[rgba(13,148,136,0.1)] transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              <div className="flex-1" />
              <span className="text-xs text-slate-500">Blog Engine</span>
            </header>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </TabContext.Provider>
    </BlogProvider>
  )
}
