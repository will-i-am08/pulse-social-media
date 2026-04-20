'use client'

import { useState, type ReactNode } from 'react'
import { PhotoIcon, EyeIcon, HandThumbUpIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import toast from 'react-hot-toast'
import StatusBadge from './StatusBadge'
import PlatformChip from './PlatformChip'
import { fmtDateTime } from '@/lib/utils'
import type { Post, Brand } from '@/lib/types'

interface Props {
  post: Post
  brand?: Brand
  /** Inline actions rendered on the right. Pass buttons etc. */
  actions?: ReactNode
  /** When true, the card starts collapsed and reveals full caption on click. */
  collapsible?: boolean
  /** Optional selection checkbox state. */
  selected?: boolean
  onSelect?: (selected: boolean) => void
  /** Show scheduled time instead of created_date when scheduled. */
  showScheduledTime?: boolean
  /** Click-through for the card body (except checkbox & action buttons). */
  onClick?: () => void
}

export default function PostCard({
  post,
  brand,
  actions,
  collapsible = true,
  selected,
  onSelect,
  showScheduledTime = false,
  onClick,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const isExpandable = collapsible && post.caption.length > 140

  function handleHeaderClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-no-toggle]')) return
    if (onClick) { onClick(); return }
    if (isExpandable) setExpanded(v => !v)
  }

  const timeValue = showScheduledTime && post.scheduled_at ? post.scheduled_at : post.created_date

  return (
    <div className="card overflow-hidden">
      <div
        className="group flex items-center gap-3 p-4 cursor-pointer hover:bg-[rgba(255,84,115,0.04)] transition-colors"
        onClick={handleHeaderClick}
      >
        {onSelect && (
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#ff5473] flex-shrink-0"
            checked={!!selected}
            onChange={e => onSelect(e.target.checked)}
            onClick={e => e.stopPropagation()}
            data-no-toggle
          />
        )}

        {post.image_url ? (
          <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#2b2a29] flex items-center justify-center flex-shrink-0">
            <PhotoIcon className="w-6 h-6 text-[#5a4042]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {brand && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ background: brand.color || '#ff5473' }}
              >
                {brand.name[0]}
              </div>
            )}
            <span className="text-sm font-medium text-[#e6e1e1]">{brand?.name || 'Unknown'}</span>
            <StatusBadge status={post.status} />
            {(post.platforms || []).map(p => (
              <PlatformChip key={p} platform={p} />
            ))}
            {post.client_visible && <EyeIcon className="w-3.5 h-3.5 text-[#e1bec0]" title="Visible to client" />}
            {post.client_approved && <HandThumbUpIcon className="w-3.5 h-3.5 text-emerald-400" title="Client approved" />}
          </div>
          <p className={`text-sm text-[#e1bec0] ${expanded ? 'whitespace-pre-wrap' : 'truncate'}`}>
            {post.caption || '(No caption)'}
          </p>
          {timeValue && (
            <p className="text-xs text-[#5a4042] mt-1">{fmtDateTime(timeValue)}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0" data-no-toggle>
            {actions}
          </div>
        )}
      </div>

      {expanded && post.image_urls && post.image_urls.length > 1 && (
        <div className="px-4 pb-4 flex gap-2 flex-wrap">
          {post.image_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="h-20 w-20 object-cover rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}

/** Convenience action components used by Queue/Drafts/Approvals/Sent. */
export function CopyCaptionButton({ caption }: { caption: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(caption); toast.success('Copied') }}
      className="btn btn-o btn-sm"
      title="Copy caption"
      data-no-toggle
    >
      <PencilSquareIcon className="w-3.5 h-3.5" />
    </button>
  )
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-d btn-sm opacity-60 hover:opacity-100 transition-opacity"
      title="Delete"
      data-no-toggle
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
  )
}
