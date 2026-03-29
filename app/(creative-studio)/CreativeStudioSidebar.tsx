'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PhotoIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/16/solid'

interface Props {
  onClose: () => void
}

const NAV = [
  { href: '/creative-studio', label: 'Library', icon: PhotoIcon },
  { href: '/creative-studio/ai', label: 'AI Studio', icon: SparklesIcon },
]

export default function CreativeStudioSidebar({ onClose }: Props) {
  const pathname = usePathname()
  void onClose

  return (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Back to apps */}
      <Link
        href="/apps"
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#6b7280] hover:text-[#fcd34d] transition-colors mb-4"
      >
        <ArrowLeftIcon className="w-3 h-3" />
        All Apps
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)' }}
        >
          <PhotoIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[#fcd34d] text-sm">Creative Studio</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/creative-studio' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`cs-nav-item ${active ? 'active' : ''}`}
              style={active ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d', borderLeftColor: '#f59e0b' } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
