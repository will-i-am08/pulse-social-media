'use client'

import Link from 'next/link'
import { PencilSquareIcon } from '@heroicons/react/16/solid'
import BrandSwitcher from './BrandSwitcher'
import PlatformChip from './PlatformChip'
import { useActiveBrand } from '@/context/BrandContext'

interface Props {
  onMobileMenu: () => void
}

export default function TopBar({ onMobileMenu }: Props) {
  const { activeBrand } = useActiveBrand()
  const platforms = activeBrand?.platforms || []

  return (
    <div className="topbar">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenu}
        className="md:hidden text-[#e1bec0] text-xl"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Brand switcher */}
      <BrandSwitcher />

      {/* Platform chips (which socials this brand is set up for) */}
      {activeBrand && platforms.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5">
          {platforms.map(p => <PlatformChip key={p} platform={p} />)}
        </div>
      )}

      <div className="flex-1" />

      <Link href="/compose" className="btn btn-p flex items-center gap-1.5">
        <PencilSquareIcon className="w-4 h-4" />
        <span className="hidden sm:inline">New Post</span>
        <span className="sm:hidden">New</span>
      </Link>
    </div>
  )
}
