'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  CodeBracketIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/16/solid'
import { buildLlmsTxt, buildLlmsFullTxt } from '@/lib/geo/schema-builder'

export default function LlmsPage() {
  const [siteUrl, setSiteUrl] = useState('')
  const [tab, setTab] = useState<'basic' | 'full'>('basic')
  const [pages, setPages] = useState([{ url: '', title: '', description: '', content: '' }])
  const [preview, setPreview] = useState('')
  const [connectionId, setConnectionId] = useState('')
  const [pushing, setPushing] = useState(false)

  function generate() {
    const validPages = pages.filter(p => p.url && p.title)
    if (!siteUrl || validPages.length === 0) { toast.error('Add site URL and at least one page'); return }
    const txt = tab === 'basic'
      ? buildLlmsTxt(siteUrl, validPages)
      : buildLlmsFullTxt(siteUrl, validPages)
    setPreview(txt)
    toast.success('Generated!')
  }

  async function pushToSite() {
    if (!connectionId.trim()) { toast.error('Enter a connection ID to push'); return }
    if (!preview) { toast.error('Generate the file first'); return }
    setPushing(true)
    try {
      const res = await fetch('/api/geo-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          changeSet: [{
            type: tab === 'basic' ? 'llms-txt' : 'llms-full-txt',
            target: tab === 'basic' ? 'public/llms.txt' : 'public/llms-full.txt',
            content: preview,
            commitMessage: `GEO: update ${tab === 'basic' ? 'llms.txt' : 'llms-full.txt'}`,
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Push failed')
      toast.success('Pushed to site!')
    } catch (err) {
      toast.error(String(err))
    }
    setPushing(false)
  }

  function addPage() {
    setPages(p => [...p, { url: '', title: '', description: '', content: '' }])
  }

  function updatePage(i: number, field: string, value: string) {
    setPages(p => p.map((pg, idx) => idx === i ? { ...pg, [field]: value } : pg))
  }

  const inp = 'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">llms.txt Manager</h1>
        <p className="text-slate-400">Generate and push llms.txt / llms-full.txt to help AI assistants index your site</p>
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-[rgba(255,255,255,0.04)] rounded-lg w-fit mb-6">
        {(['basic', 'full'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{ background: tab === t ? 'rgba(99,102,241,0.4)' : 'transparent', color: tab === t ? '#a5b4fc' : '#64748b' }}
          >
            {t === 'basic' ? 'llms.txt' : 'llms-full.txt'}
          </button>
        ))}
      </div>

      <div className="geo-glass p-6 mb-5">
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Site URL</label>
          <input className={inp} placeholder="https://example.com" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Pages</span>
            <button onClick={addPage} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              + Add page
            </button>
          </div>
          {pages.map((pg, i) => (
            <div key={i} className="p-3 bg-[rgba(255,255,255,0.03)] rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="https://example.com/page" value={pg.url} onChange={e => updatePage(i, 'url', e.target.value)} />
                <input className={inp} placeholder="Page title" value={pg.title} onChange={e => updatePage(i, 'title', e.target.value)} />
              </div>
              <input className={inp} placeholder="Short description" value={pg.description} onChange={e => updatePage(i, 'description', e.target.value)} />
              {tab === 'full' && (
                <textarea className={inp} rows={3} placeholder="Page content (for llms-full.txt)" value={pg.content} onChange={e => updatePage(i, 'content', e.target.value)} />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={generate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
          >
            <SparklesIcon className="w-4 h-4" /> Generate
          </button>
          {preview && (
            <button
              onClick={() => { navigator.clipboard.writeText(preview); toast.success('Copied!') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] hover:border-indigo-500 transition-all"
            >
              <ClipboardDocumentIcon className="w-4 h-4" /> Copy
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="geo-glass p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">{tab === 'basic' ? 'llms.txt' : 'llms-full.txt'} Preview</span>
          </div>
          <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono bg-[rgba(0,0,0,0.3)] p-3 rounded-lg max-h-64 overflow-y-auto">{preview}</pre>

          {/* Push to site */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Connection ID (from Site Controller)</label>
              <input className={inp} placeholder="uuid" value={connectionId} onChange={e => setConnectionId(e.target.value)} />
            </div>
            <button
              onClick={pushToSite}
              disabled={pushing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.4)', opacity: pushing ? 0.6 : 1 }}
            >
              {pushing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
              {pushing ? 'Pushing…' : 'Push to Site'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
