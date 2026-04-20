'use client'

import Link from 'next/link'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useActiveBrand } from '@/context/BrandContext'
import PlatformChip from '@/components/app/PlatformChip'
import { PlusIcon, PencilIcon, ArrowUpRightIcon, CheckCircleIcon } from '@heroicons/react/16/solid'

/**
 * Brands — index of all brand profiles for this workspace.
 * Detailed editing still lives in the /brand-research module; this page gives a
 * proper overview and a clear entry point to that flow.
 */
export default function BrandsPage() {
  const { brands, posts } = useWorkspace()
  const { activeBrandId, setActiveBrandId } = useActiveBrand()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Brands</h1>
          <p className="text-[#e1bec0] mt-1 text-sm">
            {brands.length} brand{brands.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <Link href="/brand-research" className="btn btn-p flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">No brands yet</p>
          <p className="text-[#5a4042] text-sm mb-4">Create your first brand to start drafting and scheduling content.</p>
          <Link href="/brand-research" className="btn btn-p flex items-center gap-2 w-fit mx-auto">
            <PlusIcon className="w-4 h-4" /> Create a brand
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {brands.map(b => {
            const brandPosts = posts.filter(p => p.brand_profile_id === b.id)
            const published = brandPosts.filter(p => p.status === 'published').length
            const scheduled = brandPosts.filter(p => p.status === 'scheduled' || p.status === 'approved').length
            const drafts = brandPosts.filter(p => p.status === 'draft').length
            const bufferConnected = (b.buffer_profile_ids || []).length > 0
            const isActive = activeBrandId === b.id

            return (
              <div key={b.id} className={`card p-5 transition-colors ${isActive ? 'border-[rgba(255,84,115,0.5)]' : ''}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                    style={{ background: b.color || '#ff5473' }}
                  >
                    {b.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#e6e1e1] truncate">{b.name}</h3>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5473] bg-[rgba(255,84,115,0.12)] px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#e1bec0] capitalize">
                      {b.tone || 'professional'} · {b.output_length || 'medium'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {(b.platforms || []).map(p => <PlatformChip key={p} platform={p} />)}
                  {bufferConnected && (
                    <span className="platform-chip" title="Connected to Buffer">
                      <CheckCircleIcon className="w-3 h-3 mr-0.5" /> Buffer
                    </span>
                  )}
                </div>

                <div className="flex gap-3 text-xs mb-4 flex-wrap">
                  <span className="badge bd-pub">{published} published</span>
                  <span className="badge bd-sched">{scheduled} scheduled</span>
                  <span className="badge bd-draft">{drafts} draft{drafts !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveBrandId(isActive ? null : b.id)}
                    className={`btn btn-sm ${isActive ? 'btn-p' : 'btn-o'}`}
                  >
                    {isActive ? 'Deselect' : 'Set Active'}
                  </button>
                  <Link href="/brand-research" className="btn btn-sm btn-o flex items-center gap-1">
                    <PencilIcon className="w-3 h-3" /> Edit
                  </Link>
                  {b.website && (
                    <a
                      href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-o flex items-center gap-1"
                    >
                      <ArrowUpRightIcon className="w-3 h-3" /> Website
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 text-xs text-[#5a4042] text-center">
        Full brand management lives in <Link href="/brand-research" className="text-[#ffb2b9] underline">Brand Research</Link>.
      </div>
    </div>
  )
}
