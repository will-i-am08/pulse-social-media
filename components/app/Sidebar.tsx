'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useEffect, useRef } from 'react'
import type { Role } from '@/lib/types'
import {
  HomeIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  TagIcon,
  PhotoIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  SparklesIcon,
  UserIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
} from '@heroicons/react/16/solid'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',     icon: HomeIcon,          href: '/dashboard',    roles: ['admin','team','client'] },
  { id: 'create-post',  label: 'Create Post',   icon: PencilSquareIcon,  href: '/create-post',  roles: ['admin','team'] },
  { id: 'posts',        label: 'Posts',         icon: DocumentTextIcon,  href: '/posts',        roles: ['admin','team','client'] },
  { id: 'calendar',     label: 'Calendar',      icon: CalendarDaysIcon,  href: '/calendar',     roles: ['admin','team'] },
  { id: 'brands',       label: 'Brands',        icon: TagIcon,           href: '/brands',       roles: ['admin','team'] },
  { id: 'photos',       label: 'Photo Library', icon: PhotoIcon,         href: '/photos',       roles: ['admin','team'] },
  { id: 'analytics',    label: 'Analytics',     icon: ChartBarIcon,      href: '/analytics',    roles: ['admin','team'] },
  { id: 'clients',      label: 'Clients',       icon: UsersIcon,         href: '/clients',      roles: ['admin'] },
  { id: 'team',         label: 'Team',          icon: UserGroupIcon,     href: '/team',         roles: ['admin'] },
  { id: 'holidays',     label: 'Holidays',      icon: SparklesIcon,      href: '/holidays',     roles: ['admin','team'] },
  { id: 'refurb-stock', label: 'Refurb Stock',  icon: ShoppingBagIcon,   href: '/refurb-stock', roles: ['admin','team'] },
]

interface SidebarProps {
  role: Role
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)

  const filtered = NAV_ITEMS.filter(n => n.roles.includes(role))

  // Close on outside click (mobile)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[199]"
          onClick={onClose}
        />
      )}

      <nav
        ref={sidebarRef}
        id="sidebar"
        className={`
          w-[236px] min-h-screen bg-[#141313] border-r border-[rgba(90,64,66,0.2)]
          p-4 flex-shrink-0 flex flex-col transition-transform duration-200
          md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-[200]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo + app switcher */}
        <div className="mb-4 px-2 pt-2">
          <Link href="/apps" onClick={onClose} className="flex items-center gap-1.5 text-xs text-[#5a4042] hover:text-[#e1bec0] transition-colors mb-3">
            <Squares2X2Icon className="w-3 h-3" /> All Apps
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg thermal-gradient flex items-center justify-center text-white font-bold text-sm">CC</div>
            <span className="font-bold text-base text-[#ffb2b9]">CaptionCraft</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(n => {
            const Icon = n.icon
            const isActive = pathname === n.href || pathname.startsWith(n.href + '/')
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={onClose}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{n.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="pt-4 border-t border-[rgba(90,64,66,0.2)] space-y-0.5">
          <Link href="/profile" onClick={onClose} className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}>
            <UserIcon className="w-4 h-4 flex-shrink-0" /><span>Profile</span>
          </Link>
          {role === 'admin' && (
            <Link href="/settings" onClick={onClose} className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
              <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" /><span>Settings</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
