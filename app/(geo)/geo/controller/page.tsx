'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  CpuChipIcon,
  CodeBracketIcon,
  ShoppingBagIcon,
} from '@heroicons/react/16/solid'

interface Connection {
  id: string
  display_name: string
  site_url: string
  platform: 'wordpress' | 'shopify' | 'github' | 'static'
  created_at: string
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  wordpress: GlobeAltIcon,
  shopify: ShoppingBagIcon,
  github: CodeBracketIcon,
  static: CpuChipIcon,
}

const PLATFORM_COLOR: Record<string, string> = {
  wordpress: '#3b82f6',
  shopify: '#10b981',
  github: '#a78bfa',
  static: '#f59e0b',
}

export default function ControllerPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    displayName: '', siteUrl: '', platform: 'wordpress' as Connection['platform'],
    apiKey: '', wpUsername: '', shopifyShop: '', githubOwner: '', githubRepo: '', githubBranch: 'main',
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/geo-connections')
      const data = await res.json()
      setConnections(data.connections || [])
    } catch { toast.error('Failed to load connections') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addConnection() {
    setSaving(true)
    try {
      const res = await fetch('/api/geo-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName,
          siteUrl: form.siteUrl,
          platform: form.platform,
          apiKey: form.apiKey || undefined,
          wpUsername: form.wpUsername || undefined,
          shopifyShop: form.shopifyShop || undefined,
          githubOwner: form.githubOwner || undefined,
          githubRepo: form.githubRepo || undefined,
          githubBranch: form.githubBranch || 'main',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Connection added')
      setShowAdd(false)
      setForm({ displayName: '', siteUrl: '', platform: 'wordpress', apiKey: '', wpUsername: '', shopifyShop: '', githubOwner: '', githubRepo: '', githubBranch: 'main' })
      load()
    } catch (err) {
      toast.error(String(err))
    }
    setSaving(false)
  }

  async function deleteConnection(id: string) {
    if (!confirm('Remove this connection?')) return
    try {
      await fetch(`/api/geo-connections?id=${id}`, { method: 'DELETE' })
      toast.success('Removed')
      setConnections(c => c.filter(x => x.id !== id))
    } catch { toast.error('Failed to remove') }
  }

  const inp = 'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600'
  const lbl = 'block text-xs font-medium text-slate-400 mb-1'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Site Controller</h1>
          <p className="text-slate-400">Manage WordPress, Shopify, and GitHub connections</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
        >
          <PlusIcon className="w-4 h-4" /> Add Site
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="geo-glass p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">New Site Connection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Display Name *</label>
              <input className={inp} placeholder="My WordPress Blog" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
            </div>
            <div>
              <label className={lbl}>Site URL *</label>
              <input className={inp} placeholder="https://example.com" value={form.siteUrl} onChange={e => setForm(f => ({ ...f, siteUrl: e.target.value }))} />
            </div>
            <div>
              <label className={lbl}>Platform *</label>
              <select className={inp} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Connection['platform'] }))}>
                <option value="wordpress">WordPress</option>
                <option value="shopify">Shopify</option>
                <option value="github">GitHub</option>
                <option value="static">Static (audit only)</option>
              </select>
            </div>
            {form.platform !== 'static' && (
              <div>
                <label className={lbl}>{form.platform === 'wordpress' ? 'App Password' : form.platform === 'shopify' ? 'Admin API Token' : 'Personal Access Token'}</label>
                <input className={inp} type="password" placeholder="Stored encrypted" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} />
              </div>
            )}
            {form.platform === 'wordpress' && (
              <div>
                <label className={lbl}>WordPress Username</label>
                <input className={inp} placeholder="admin" value={form.wpUsername} onChange={e => setForm(f => ({ ...f, wpUsername: e.target.value }))} />
              </div>
            )}
            {form.platform === 'shopify' && (
              <div>
                <label className={lbl}>Shopify Shop (mystore.myshopify.com)</label>
                <input className={inp} placeholder="mystore.myshopify.com" value={form.shopifyShop} onChange={e => setForm(f => ({ ...f, shopifyShop: e.target.value }))} />
              </div>
            )}
            {form.platform === 'github' && (
              <>
                <div>
                  <label className={lbl}>GitHub Owner</label>
                  <input className={inp} placeholder="username or org" value={form.githubOwner} onChange={e => setForm(f => ({ ...f, githubOwner: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Repository</label>
                  <input className={inp} placeholder="repo-name" value={form.githubRepo} onChange={e => setForm(f => ({ ...f, githubRepo: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Branch</label>
                  <input className={inp} placeholder="main" value={form.githubBranch} onChange={e => setForm(f => ({ ...f, githubBranch: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button
              onClick={addConnection}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'rgba(99,102,241,0.4)' }}
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Connection'}
            </button>
          </div>
        </div>
      )}

      {/* Connections list */}
      {loading ? (
        <div className="text-center py-16 text-slate-600"><ArrowPathIcon className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : connections.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <CpuChipIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No sites connected yet</p>
          <p className="text-sm mt-1">Add your first site to start pushing GEO fixes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => {
            const Icon = PLATFORM_ICONS[conn.platform] || GlobeAltIcon
            const color = PLATFORM_COLOR[conn.platform] || '#6366f1'
            return (
              <div key={conn.id} className="geo-glass p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{conn.display_name}</div>
                  <div className="text-xs text-slate-500 truncate">{conn.site_url}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${color}20`, color }}>
                  {conn.platform}
                </span>
                <button onClick={() => deleteConnection(conn.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1.5">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
