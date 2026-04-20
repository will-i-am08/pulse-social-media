'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  MegaphoneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
  ArrowRightStartOnRectangleIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  BoltIcon,
} from '@heroicons/react/16/solid'

interface AppCard {
  id: string
  name: string
  description: string
  href?: string
  icon: React.ElementType
  gradient: string
  badge?: string
}

const APPS: AppCard[] = [
  {
    id: 'captioncraft',
    name: 'CaptionCraft',
    description: 'Social media scheduling, AI captions, brand management and client portals.',
    href: '/queue',
    icon: MegaphoneIcon,
    gradient: 'linear-gradient(135deg, #ff5473 0%, #ffb2b9 100%)',
  },
  {
    id: 'geo',
    name: 'SEO Command Center',
    description: 'Full SEO toolkit: on-page analysis, keyword research, technical audits, AI visibility monitoring, schema and llms.txt management.',
    href: '/geo',
    icon: GlobeAltIcon,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  },
  {
    id: 'brand-research',
    name: 'Brand Research',
    description: 'Central brand hub: profiles, AI research reports, brand voice guidelines and competitor analysis. Shared across all apps.',
    href: '/brand-research',
    icon: BuildingStorefrontIcon,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
  },
  {
    id: 'blog-engine',
    name: 'Blog Engine',
    description: 'AI-powered multi-brand blog creation, idea generation, SEO-optimised content.',
    href: '/blog-engine',
    icon: PencilSquareIcon,
    gradient: 'linear-gradient(135deg, #0d9488 0%, #5eead4 100%)',
  },
  {
    id: 'proposals',
    name: 'Proposals & Contracts',
    description: 'AI-powered proposals and contracts with expiry tracking, e-signatures, templates, and PDF export.',
    href: '/proposals',
    icon: DocumentTextIcon,
    gradient: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    description: 'Photo library, canvas editor, AI image generation and brand asset management. Synced across all apps.',
    href: '/creative-studio',
    icon: PhotoIcon,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)',
  },
  {
    id: 'automations',
    name: 'Automations',
    description: 'Multi-step workflow automation: schedule blog posts, run SEO audits, chain AI tasks together.',
    href: '/automations',
    icon: BoltIcon,
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)',
  },
]

export default function AppsPage() {
  const router = useRouter()

  async function handleSignOut() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f0e0e] flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(90,64,66,0.2)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}>
            P
          </div>
          <span className="font-bold text-[#ffb2b9] text-lg">Pulse Digital</span>
        </div>
        <Link
          href="/account"
          className="flex items-center gap-2 text-sm text-[#e1bec0] hover:text-[#ffb2b9] transition-colors mr-3"
        >
          <Cog6ToothIcon className="w-4 h-4" />
          Account
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-[#e1bec0] hover:text-[#ffb2b9] transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#e6e1e1] mb-2">Your Apps</h1>
          <p className="text-[#e1bec0]">Select an app to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {APPS.map(app => {
            const Icon = app.icon
            const isAvailable = !!app.href

            const card = (
              <div
                key={app.id}
                className={`
                  relative group rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200
                  ${isAvailable
                    ? 'border-[rgba(90,64,66,0.3)] bg-[#1c1b1b] hover:border-[rgba(255,84,115,0.4)] hover:bg-[#211f1f] cursor-pointer'
                    : 'border-[rgba(90,64,66,0.15)] bg-[#181717] opacity-60 cursor-default'
                  }
                `}
              >
                {app.badge && (
                  <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(90,64,66,0.3)] text-[#e1bec0]">
                    {app.badge}
                  </span>
                )}

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: app.gradient }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="font-bold text-lg text-[#e6e1e1] mb-1">{app.name}</h2>
                  <p className="text-sm text-[#e1bec0] leading-relaxed">{app.description}</p>
                </div>

                {isAvailable && (
                  <div className="flex items-center gap-1 text-sm text-[#ff5473] font-medium mt-auto group-hover:gap-2 transition-all">
                    Open app
                    <SparklesIcon className="w-3 h-3" />
                  </div>
                )}
              </div>
            )

            return isAvailable ? (
              <Link key={app.id} href={app.href!} className="block">
                {card}
              </Link>
            ) : (
              <div key={app.id}>{card}</div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
