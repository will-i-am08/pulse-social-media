'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/16/solid'

interface Props {
  onClose: () => void
}

const NAV = [
  { href: '/brand-research', label: 'Brands', icon: BuildingStorefrontIcon },
  { href: '/brand-research/reports', label: 'All Reports', icon: DocumentTextIcon },
]

export default function BrandResearchSidebar({ onClose }: Props) {
  const pathname = usePathname()
  void onClose

  return (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Back to apps */}
      <Link
        href="/apps"
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#6b7280] hover:text-[#a78bfa] transition-colors mb-4"
      >
        <ArrowLeftIcon className="w-3 h-3" />
        All Apps
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)' }}
        >
          <BuildingStorefrontIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[#c4b5fd] text-sm">Brand Research</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/brand-research' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`blog-nav-item ${active ? 'active' : ''}`}
              style={active ? { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderLeftColor: '#8b5cf6' } : {}}
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
