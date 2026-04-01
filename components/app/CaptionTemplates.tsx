'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  BookmarkIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import { createClient } from '@/lib/supabase/client'

interface Template {
  id: string
  name: string
  prompt: string
  caption: string
  brandId: string
  createdAt: string
}

interface Props {
  onUseCaption: (caption: string) => void
  onUsePrompt: (prompt: string) => void
  currentCaption?: string
  currentPrompt?: string
  brandId?: string
  isOpen: boolean
  onClose: () => void
}

export default function CaptionTemplates({ onUseCaption, onUsePrompt, currentCaption, currentPrompt, brandId, isOpen, onClose }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      sb.from('caption_templates')
        .select('data')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setTemplates(data.map((r: { data: Template }) => r.data))
        })
    })
  }, [isOpen])

  async function saveAsTemplate() {
    if (!saveName.trim()) { toast.error('Enter a name for this template'); return }
    if (!currentCaption && !currentPrompt) { toast.error('Nothing to save — generate a caption or enter a prompt first'); return }
    if (!userId) { toast.error('Not logged in'); return }
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      prompt: currentPrompt || '',
      caption: currentCaption || '',
      brandId: brandId || '',
      createdAt: new Date().toISOString(),
    }
    const sb = createClient()
    const { error } = await sb.from('caption_templates').insert({ id: newTemplate.id, user_id: userId, data: newTemplate })
    if (error) { toast.error('Failed to save template'); return }
    setTemplates(prev => [newTemplate, ...prev])
    setSaveName('')
    setShowSave(false)
    toast.success('Template saved!')
  }

  async function deleteTemplate(id: string) {
    const sb = createClient()
    const { error } = await sb.from('caption_templates').delete().eq('id', id)
    if (error) { toast.error('Failed to delete template'); return }
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="card p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#e6e1e1] flex items-center gap-2">
            <BookmarkIcon className="w-5 h-5 text-[#ff5473]" /> Caption Templates
          </h3>
          <button onClick={onClose} className="text-[#5a4042] hover:text-[#e1bec0]">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Save current */}
        {(currentCaption || currentPrompt) && (
          <div className="mb-4 p-3 bg-[#211f1f] rounded-lg">
            {showSave ? (
              <div className="flex gap-2">
                <input className="inp flex-1" placeholder="Template name..." value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveAsTemplate()} />
                <button onClick={saveAsTemplate} className="btn btn-p btn-sm">Save</button>
                <button onClick={() => setShowSave(false)} className="btn btn-o btn-sm">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSave(true)} className="btn btn-o btn-sm w-full flex items-center justify-center gap-1">
                <BookmarkIcon className="w-3 h-3" /> Save Current as Template
              </button>
            )}
          </div>
        )}

        {/* Template list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {templates.length === 0 ? (
            <p className="text-sm text-[#5a4042] text-center py-8">No templates saved yet. Generate a caption you like, then save it here.</p>
          ) : templates.map(t => (
            <div key={t.id} className="p-3 bg-[#2b2a29] rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#e6e1e1]">{t.name}</span>
                <button onClick={() => deleteTemplate(t.id)} className="text-[#5a4042] hover:text-red-400">
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
              {t.prompt && <p className="text-xs text-[#5a4042] mb-1">Prompt: {t.prompt.slice(0, 80)}{t.prompt.length > 80 ? '...' : ''}</p>}
              {t.caption && <p className="text-xs text-[#e1bec0] mb-2 line-clamp-3">{t.caption}</p>}
              <div className="flex gap-2">
                {t.caption && (
                  <button onClick={() => { onUseCaption(t.caption); onClose() }} className="btn btn-o btn-sm flex items-center gap-1">
                    <ClipboardDocumentIcon className="w-3 h-3" /> Use Caption
                  </button>
                )}
                {t.prompt && (
                  <button onClick={() => { onUsePrompt(t.prompt); onClose() }} className="btn btn-o btn-sm flex items-center gap-1">
                    Use Prompt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
