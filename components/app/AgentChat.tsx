'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useWorkspaceOptional } from '@/context/WorkspaceContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolActivity?: string[]
}

const TOOL_LABELS: Record<string, string> = {
  list_brands: 'Fetching brands',
  list_posts: 'Fetching posts',
  create_post: 'Creating post',
  update_post_status: 'Updating post',
  generate_caption: 'Generating caption',
  send_to_buffer: 'Sending to Buffer',
  get_workspace_summary: 'Loading summary',
  navigate: 'Navigating',
  search_photos: 'Searching photos',
  list_folders: 'Fetching folders',
  create_folder: 'Creating folder',
  move_photos_to_folder: 'Moving photos',
  update_photo_tags: 'Updating tags',
  delete_folder: 'Deleting folder',
  list_proposals: 'Fetching proposals',
  get_proposal: 'Loading proposal',
  create_proposal: 'Creating proposal',
  update_proposal_status: 'Updating proposal',
  list_blog_posts: 'Fetching blog posts',
  get_blog_post: 'Loading blog post',
  create_blog_post: 'Creating blog post',
  update_blog_post_status: 'Updating blog post',
  list_automations: 'Fetching automations',
  toggle_automation: 'Toggling automation',
  run_automation: 'Running automation',
}

export default function AgentChat() {
  const router = useRouter()
  const workspace = useWorkspaceOptional()
  const brands = workspace?.brands ?? []
  const posts = workspace?.posts ?? []
  const settings = workspace?.settings ?? { workspaceName: '', timezone: 'UTC', defaultPlatforms: [], emailNotifications: false, autoSendOnApprove: false, model: 'claude-sonnet-4-6' }
  const currentUserId = workspace?.currentUserId ?? null
  const reload = workspace?.reload ?? (async () => {})
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const storageKey = currentUserId ? `agent_chat_history_${currentUserId}` : null

  // Load persisted messages on mount / when userId available
  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey])

  // Persist messages to localStorage
  const persistMessages = useCallback((msgs: Message[]) => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs))
    } catch {
      // ignore quota errors
    }
  }, [storageKey])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  const clearConversation = () => {
    setMessages([])
    if (storageKey) localStorage.removeItem(storageKey)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    persistMessages(newMessages)
    setLoading(true)

    // Build workspace context snapshot
    const postCounts: Record<string, number> = {}
    for (const p of posts) {
      postCounts[p.status] = (postCounts[p.status] || 0) + 1
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          workspaceContext: {
            brands: brands.map(b => ({ id: b.id, name: b.name, platforms: b.platforms || [], buffer_profile_ids: b.buffer_profile_ids || [] })),
            postCounts,
            settings: { workspaceName: settings.workspaceName, timezone: settings.timezone },
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errMsg: Message = { role: 'assistant', content: `Error: ${data.error || 'Something went wrong'}` }
        const updated = [...newMessages, errMsg]
        setMessages(updated)
        persistMessages(updated)
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || '',
        toolActivity: data.toolActivity?.length ? data.toolActivity : undefined,
      }
      const updated = [...newMessages, assistantMessage]
      setMessages(updated)
      persistMessages(updated)

      // Handle side effects
      if (data.workspaceChanged) {
        await reload()
      }
      for (const action of (data.clientActions || [])) {
        if (action.type === 'navigate' && action.path) {
          router.push(action.path)
        }
      }
    } catch {
      const errMsg: Message = { role: 'assistant', content: 'This task took too long to complete. Try breaking it into smaller steps, or ask me to do one thing at a time.' }
      const updated = [...newMessages, errMsg]
      setMessages(updated)
      persistMessages(updated)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating button — hidden when panel is open */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Paul assistant"
          className="fixed bottom-6 right-6 z-[300] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ffb2b9, #e1627a)' }}
        >
          <SparklesIcon className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-[299] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '380px', background: '#141313', borderLeft: '1px solid rgba(90,64,66,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(90,64,66,0.2)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#ffb2b9]" />
            <span className="font-semibold text-[#e1bec0] text-sm">Paul</span>
            <span className="text-[10px] text-[#5a4042] bg-[#1e1b1b] px-1.5 py-0.5 rounded-full">co-worker</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                title="Clear conversation"
                className="p-1.5 rounded text-[#5a4042] hover:text-[#e1bec0] hover:bg-[#1e1b1b] transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded text-[#5a4042] hover:text-[#e1bec0] hover:bg-[#1e1b1b] transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(255,178,185,0.15), rgba(225,98,122,0.1))' }}
              >
                <SparklesIcon className="w-6 h-6 text-[#ffb2b9]" />
              </div>
              <p className="text-[#e1bec0] text-sm font-medium mb-1">Hey, I&apos;m Paul</p>
              <p className="text-[#5a4042] text-xs leading-relaxed">
                I can create posts, manage photos, send to Buffer, write blog content, navigate anywhere in the platform, and more. Just ask.
              </p>
              <div className="mt-4 space-y-1.5">
                {[
                  'What brands do I have?',
                  'Show me my draft posts',
                  'Create a post for my latest brand',
                  'Take me to the blog engine',
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion) }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg text-[#e1bec0] hover:text-white transition-colors"
                    style={{ background: 'rgba(90,64,66,0.12)', border: '1px solid rgba(90,64,66,0.2)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'text-[#141313] font-medium rounded-br-sm'
                    : 'text-[#e1bec0] rounded-bl-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: '#ffb2b9' }
                    : { background: '#1e1b1b', border: '1px solid rgba(90,64,66,0.2)' }
                }
              >
                {/* Tool activity chips */}
                {msg.toolActivity && msg.toolActivity.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[...new Set(msg.toolActivity)].map(tool => (
                      <span
                        key={tool}
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-[#ffb2b9]"
                        style={{ background: 'rgba(255,178,185,0.1)', border: '1px solid rgba(255,178,185,0.15)' }}
                      >
                        ✓ {TOOL_LABELS[tool] || tool}
                      </span>
                    ))}
                  </div>
                )}

                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:text-[#e1bec0] [&_strong]:text-white [&_code]:text-[#ffb2b9] [&_code]:bg-[rgba(255,178,185,0.1)] [&_code]:px-1 [&_code]:rounded [&_a]:text-[#ffb2b9]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5"
                style={{ background: '#1e1b1b', border: '1px solid rgba(90,64,66,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb2b9] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb2b9] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb2b9] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 border-t border-[rgba(90,64,66,0.2)]">
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: '#1e1b1b', border: '1px solid rgba(90,64,66,0.25)' }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-[#e1bec0] text-sm placeholder-[#5a4042] resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: '20px', maxHeight: '120px' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: input.trim() && !loading ? '#ffb2b9' : 'rgba(255,178,185,0.2)' }}
            >
              <PaperAirplaneIcon className={`w-3.5 h-3.5 ${input.trim() && !loading ? 'text-[#141313]' : 'text-[#ffb2b9]'}`} />
            </button>
          </div>
          <p className="text-[10px] text-[#5a4042] text-center mt-1.5">Enter to send · Shift+Enter for newline</p>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[298]"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
