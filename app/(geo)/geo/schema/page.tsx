'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
} from '@heroicons/react/16/solid'

type SchemaType = 'article' | 'product' | 'organization'

export default function SchemaPage() {
  const [type, setType] = useState<SchemaType>('article')
  const [form, setForm] = useState<Record<string, string>>({
    url: '', title: '', description: '', authorName: '', publishedDate: '',
    organizationName: '', organizationUrl: '', name: '', price: '',
    currency: 'USD', availability: 'InStock', brandName: '',
    email: '', phone: '', address: '',
  })
  const [schema, setSchema] = useState('')
  const [generating, setGenerating] = useState(false)
  const [connectionId, setConnectionId] = useState('')
  const [target, setTarget] = useState('')
  const [pushing, setPushing] = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      const payload: Record<string, unknown> = { type, ...form }
      if (type === 'product' && form.price) payload.price = Number(form.price)
      const res = await fetch('/api/geo-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSchema(JSON.stringify(data.schema, null, 2))
      toast.success('Schema generated!')
    } catch (err) {
      toast.error(String(err))
    }
    setGenerating(false)
  }

  async function pushToSite() {
    if (!connectionId.trim() || !schema) { toast.error('Fill in connection ID and generate schema first'); return }
    setPushing(true)
    try {
      const res = await fetch('/api/geo-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          changeSet: [{ type: 'schema', target: target || '1', content: schema, commitMessage: 'GEO: inject schema markup' }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Push failed')
      toast.success('Schema pushed to site!')
    } catch (err) {
      toast.error(String(err))
    }
    setPushing(false)
  }

  const inp = 'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600'
  const lbl = 'block text-xs font-medium text-slate-400 mb-1'
  const f = (key: string, val: string) => setForm(fm => ({ ...fm, [key]: val }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Schema Injector</h1>
        <p className="text-slate-400">Build JSON-LD structured data and push it directly to your site</p>
      </div>

      {/* Type selector */}
      <div className="flex gap-1 p-1 bg-[rgba(255,255,255,0.04)] rounded-lg w-fit mb-6">
        {(['article', 'product', 'organization'] as SchemaType[]).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all"
            style={{ background: type === t ? 'rgba(99,102,241,0.4)' : 'transparent', color: type === t ? '#a5b4fc' : '#64748b' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="geo-glass p-6 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type === 'article' && (
            <>
              <div><label className={lbl}>Page URL *</label><input className={inp} placeholder="https://…" value={form.url} onChange={e => f('url', e.target.value)} /></div>
              <div><label className={lbl}>Title *</label><input className={inp} value={form.title} onChange={e => f('title', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Description *</label><input className={inp} value={form.description} onChange={e => f('description', e.target.value)} /></div>
              <div><label className={lbl}>Author Name *</label><input className={inp} value={form.authorName} onChange={e => f('authorName', e.target.value)} /></div>
              <div><label className={lbl}>Published Date *</label><input className={inp} type="date" value={form.publishedDate} onChange={e => f('publishedDate', e.target.value)} /></div>
              <div><label className={lbl}>Organization Name *</label><input className={inp} value={form.organizationName} onChange={e => f('organizationName', e.target.value)} /></div>
              <div><label className={lbl}>Organization URL *</label><input className={inp} placeholder="https://…" value={form.organizationUrl} onChange={e => f('organizationUrl', e.target.value)} /></div>
            </>
          )}
          {type === 'product' && (
            <>
              <div><label className={lbl}>Product URL *</label><input className={inp} placeholder="https://…" value={form.url} onChange={e => f('url', e.target.value)} /></div>
              <div><label className={lbl}>Product Name *</label><input className={inp} value={form.name} onChange={e => f('name', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Description *</label><input className={inp} value={form.description} onChange={e => f('description', e.target.value)} /></div>
              <div><label className={lbl}>Price</label><input className={inp} type="number" value={form.price} onChange={e => f('price', e.target.value)} /></div>
              <div><label className={lbl}>Currency</label><input className={inp} placeholder="USD" value={form.currency} onChange={e => f('currency', e.target.value)} /></div>
              <div><label className={lbl}>Availability</label>
                <select className={inp} value={form.availability} onChange={e => f('availability', e.target.value)}>
                  <option>InStock</option><option>OutOfStock</option><option>PreOrder</option>
                </select>
              </div>
              <div><label className={lbl}>Brand Name</label><input className={inp} value={form.brandName} onChange={e => f('brandName', e.target.value)} /></div>
            </>
          )}
          {type === 'organization' && (
            <>
              <div><label className={lbl}>Organization Name *</label><input className={inp} value={form.name} onChange={e => f('name', e.target.value)} /></div>
              <div><label className={lbl}>Website URL *</label><input className={inp} placeholder="https://…" value={form.url} onChange={e => f('url', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Description</label><input className={inp} value={form.description} onChange={e => f('description', e.target.value)} /></div>
              <div><label className={lbl}>Email</label><input className={inp} value={form.email} onChange={e => f('email', e.target.value)} /></div>
              <div><label className={lbl}>Phone</label><input className={inp} value={form.phone} onChange={e => f('phone', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Address</label><input className={inp} value={form.address} onChange={e => f('address', e.target.value)} /></div>
            </>
          )}
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', opacity: generating ? 0.7 : 1 }}
        >
          {generating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
          {generating ? 'Generating…' : 'Generate Schema'}
        </button>
      </div>

      {/* Preview + push */}
      {schema && (
        <div className="geo-glass p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">JSON-LD Output</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(`<script type="application/ld+json">\n${schema}\n</script>`); toast.success('Copied as HTML!') }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ClipboardDocumentIcon className="w-3.5 h-3.5" /> Copy as HTML
            </button>
          </div>
          <pre className="text-xs text-slate-400 font-mono bg-[rgba(0,0,0,0.3)] p-3 rounded-lg overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">{schema}</pre>

          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Connection ID</label>
              <input className={inp} placeholder="uuid from Site Controller" value={connectionId} onChange={e => setConnectionId(e.target.value)} />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium text-slate-400 mb-1">Post / Product ID</label>
              <input className={inp} placeholder="123" value={target} onChange={e => setTarget(e.target.value)} />
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
