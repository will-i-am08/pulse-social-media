'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { Role } from '@/lib/types'
import {
  QueueListIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  PaperAirplaneIcon,
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
  BoltIcon,
  HomeIcon,
} from '@heroicons/react/16/solid'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  roles: Role[]
}

interface NavGroup {
  id: string
  label: string | null
  items: NavItem[]
}

/**
 * Buffer-style grouped navigation.
 *
 * PUBLISHING is the centre of gravity — Queue is the default landing, Drafts /
 * Approvals / Sent are status-scoped views (not dropdown filters). TOOLS holds
 * pulse-specific extras. SETTINGS/PROFILE pin to the bottom.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    id: 'publishing',
    label: 'Publishing',
    items: [
      { id: 'queue',     label: 'Queue',     icon: QueueListIcon,            href: '/queue',     roles: ['admin','team','client'] },
      { id: 'calendar',  label: 'Calendar',  icon: CalendarDaysIcon,         href: '/calendar',  roles: ['admin','team'] },
      { id: 'drafts',    label: 'Drafts',    icon: PencilSquareIcon,         href: '/drafts',    roles: ['admin','team'] },
      { id: 'approvals', label: 'Approvals', icon: ClipboardDocumentCheckIcon, href: '/approvals', roles: ['admin','team','client'] },
      { id: 'sent',      label: 'Sent',      icon: PaperAirplaneIcon,        href: '/sent',      roles: ['admin','team','client'] },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, href: '/analytics', roles: ['admin','team'] },
      { id: 'overview',  label: 'Overview',  icon: HomeIcon,     href: '/overview',  roles: ['admin','team','client'] },
    ],
  },
  {
    id: 'brands',
    label: 'Brands',
    items: [
      { id: 'brands',  label: 'Brands',  icon: TagIcon,   href: '/brands', roles: ['admin','team'] },
      { id: 'library', label: 'Library', icon: PhotoIcon, href: '/library', roles: ['admin','team'] },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'automations',  label: 'Automations', icon: BoltIcon,         href: '/automations',  roles: ['admin','team'] },
      { id: 'holidays',     label: 'Holidays',    icon: SparklesIcon,     href: '/holidays',     roles: ['admin','team'] },
      { id: 'refurb-stock', label: 'Refurb Stock',icon: ShoppingBagIcon,  href: '/refurb-stock', roles: ['admin','team'] },
      { id: 'clients',      label: 'Clients',     icon: UsersIcon,        href: '/clients',      roles: ['admin'] },
      { id: 'team',         label: 'Team',        icon: UserGroupIcon,    href: '/team',         roles: ['admin'] },
    ],
  },
]

interface SidebarProps {
  role: Role
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  function isItemActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
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
          w-[220px] min-h-screen bg-[#141313] border-r border-[rgba(90,64,66,0.2)]
          p-3 flex-shrink-0 flex flex-col transition-transform duration-200
          md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-[200]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="mb-2 px-2 pt-2">
          <Link href="/apps" onClick={onClose} className="flex items-center gap-1.5 text-[11px] text-[#5a4042] hover:text-[#e1bec0] transition-colors mb-3">
            <Squares2X2Icon className="w-3 h-3" /> All Apps
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg thermal-gradient flex items-center justify-center text-white font-bold text-xs">CC</div>
            <span className="font-bold text-[15px] text-[#ffb2b9]">CaptionCraft</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {NAV_GROUPS.map(group => {
            const visible = group.items.filter(n => n.roles.includes(role))
            if (visible.length === 0) return null
            return (
              <div key={group.id} className="mb-1">
                {group.label && <div className="nav-group-header">{group.label}</div>}
                {visible.map(n => {
                  const Icon = n.icon
                  const active = isItemActive(n.href)
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={onClose}
                      className={`nav-item ${active ? 'active' : ''}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{n.label}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Pinned: profile + settings */}
        <div className="pt-3 border-t border-[rgba(90,64,66,0.2)]">
          <Link href="/profile" onClick={onClose} className={`nav-item ${isItemActive('/profile') ? 'active' : ''}`}>
            <UserIcon className="w-4 h-4 flex-shrink-0" /><span>Profile</span>
          </Link>
          {role === 'admin' && (
            <Link href="/settings" onClick={onClose} className={`nav-item ${isItemActive('/settings') ? 'active' : ''}`}>
              <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" /><span>Settings</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
