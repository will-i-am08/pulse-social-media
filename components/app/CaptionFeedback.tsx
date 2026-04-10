'use client'

import { useState } from 'react'
import { StarIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/16/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { FEEDBACK_TAGS, type CaptionFeedback as FeedbackType } from '@/lib/caption-engine'

interface Props {
  postId: string
  brandId: string
  captionText: string
  variationPreset: string
  platforms: string[]
  onSaved?: (feedback: FeedbackType) => void
  existingRating?: number
}

export default function CaptionFeedback({
  postId,
  brandId,
  captionText,
  variationPreset,
  platforms,
  onSaved,
  existingRating,
}: Props) {
  const [rating, setRating] = useState(existingRating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const displayRating = hoverRating || rating

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  async function saveFeedback() {
    if (!rating) { toast.error('Give it a rating first'); return }
    setSaving(true)
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const feedbackData = {
        user_id: user.id,
        brand_id: brandId,
        post_id: postId,
        caption_text: captionText,
        rating,
        tags: selectedTags,
        notes,
        variation_preset: variationPreset,
        platforms,
      }

      const { error } = await sb.from('caption_feedback').insert(feedbackData)
      if (error) throw error

      setSaved(true)
      toast.success('Feedback saved — this will improve future captions')

      if (onSaved) {
        onSaved({
          id: crypto.randomUUID(),
          brandId,
          postId,
          captionText,
          rating,
          tags: selectedTags,
          notes,
          variationPreset,
          platforms,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (e: any) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <StarIcon key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400' : 'text-[#5a4042]'}`} />
          ))}
        </div>
        <span className="text-xs text-emerald-400">Feedback saved</span>
        {selectedTags.length > 0 && (
          <span className="text-[10px] text-emerald-400/60">({selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''})</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Compact: star rating + expand button */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#5a4042]">Rate this caption:</span>
        <div className="flex gap-0.5" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onMouseEnter={() => setHoverRating(i)}
              onClick={() => { setRating(i); if (!expanded) setExpanded(true) }}
              className="p-0.5 transition-transform hover:scale-110"
            >
              {i <= displayRating ? (
                <StarIcon className={`w-5 h-5 ${displayRating >= 4 ? 'text-amber-400' : displayRating >= 3 ? 'text-amber-500' : 'text-orange-400'}`} />
              ) : (
                <StarOutline className="w-5 h-5 text-[#5a4042]" />
              )}
            </button>
          ))}
        </div>

        {/* Quick thumbs */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => { setRating(5); setExpanded(true) }}
            className={`p-1 rounded-md transition-colors ${rating >= 4 ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#5a4042] hover:text-emerald-400'}`}
          >
            <HandThumbUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setRating(1); setExpanded(true) }}
            className={`p-1 rounded-md transition-colors ${rating <= 2 && rating > 0 ? 'text-red-400 bg-red-500/10' : 'text-[#5a4042] hover:text-red-400'}`}
          >
            <HandThumbDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded: tags + notes */}
      {expanded && rating > 0 && (
        <div className="space-y-3 p-3 rounded-xl border border-[rgba(90,64,66,0.3)] bg-[rgba(30,15,18,0.3)]">
          {/* Positive tags */}
          {rating >= 3 && (
            <div>
              <p className="text-[10px] text-emerald-400 mb-1.5 uppercase tracking-wide">What worked well?</p>
              <div className="flex gap-1.5 flex-wrap">
                {FEEDBACK_TAGS.positive.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 py-1 rounded-full text-[11px] transition-colors border ${selectedTags.includes(tag.id)
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/5 text-white/50 border-transparent hover:text-white/80'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Negative tags */}
          {rating <= 3 && (
            <div>
              <p className="text-[10px] text-red-400 mb-1.5 uppercase tracking-wide">What could be better?</p>
              <div className="flex gap-1.5 flex-wrap">
                {FEEDBACK_TAGS.negative.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 py-1 rounded-full text-[11px] transition-colors border ${selectedTags.includes(tag.id)
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-white/5 text-white/50 border-transparent hover:text-white/80'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <textarea
              className="ta"
              rows={2}
              placeholder="Any specific feedback? (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={saveFeedback} disabled={saving} className="btn text-sm">
              {saving ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
