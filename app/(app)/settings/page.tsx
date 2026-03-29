'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { callClaude } from '@/lib/claude'
import { uid } from '@/lib/utils'
import type { BufferChannel } from '@/lib/types'
import {
  ArrowPathIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  PlusIcon,
} from '@heroicons/react/16/solid'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney']
const PLATFORMS = ['instagram', 'facebook', 'linkedin']
const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — Fast & cheap' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — Balanced (default)' },
  { value: 'claude-opus-4-6', label: 'Opus 4.6 — Most capable' },
]
const CHANNEL_SERVICES = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'youtube', 'other']

export default function SettingsPage() {
  const { settings, saveSettings } = useWorkspace()
  const [form, setForm] = useState({ ...settings })
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: '', service: 'instagram', bufferId: '' })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => { setForm({ ...settings }) }, [settings])

  function saveAll() {
    saveSettings(form)
    toast.success('Settings saved!')
  }

  async function testClaude() {
    setTesting(true)
    setTestResult(null)
    const result = await callClaude('You are a test assistant.', 'Reply with exactly: Connection successful', 50)
    setTesting(false)
    if (result) {
      setTestResult({ ok: true, msg: result })
    } else {
      setTestResult({ ok: false, msg: 'Connection failed — check your API key in Settings' })
    }
  }

  function addChannel() {
    if (!newChannel.name.trim()) { toast.error('Channel name required'); return }
    const ch: BufferChannel = { id: uid(), name: newChannel.name, service: newChannel.service, bufferId: newChannel.bufferId }
    setForm(f => ({ ...f, bufferChannels: [...(f.bufferChannels || []), ch] }))
    setNewChannel({ name: '', service: 'instagram', bufferId: '' })
    setShowAddChannel(false)
  }

  function removeChannel(id: string) {
    setForm(f => ({ ...f, bufferChannels: (f.bufferChannels || []).filter(c => c.id !== id) }))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Settings</h1>
      <p className="text-[#e1bec0] mb-8">Configure your workspace preferences</p>

      <div className="space-y-6">
        {/* Workspace */}
        <div className="card p-6">
          <h3 className="font-semibold text-[#e6e1e1] mb-4">Workspace</h3>
          <div className="space-y-4">
            <div>
              <label className="lbl">Workspace Name</label>
              <input className="inp" value={form.workspaceName || ''} onChange={e => setForm(f => ({ ...f, workspaceName: e.target.value }))} />
            </div>
            <div>
              <label className="lbl">Default Timezone</label>
              <select className="sel" value={form.timezone || 'UTC'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Default Platforms</label>
              <div className="flex gap-4 flex-wrap">
                {PLATFORMS.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#ff5473]"
                      checked={(form.defaultPlatforms || ['instagram']).includes(p)}
                      onChange={e => setForm(f => ({
                        ...f,
                        defaultPlatforms: e.target.checked
                          ? [...(f.defaultPlatforms || []), p]
                          : (f.defaultPlatforms || []).filter(x => x !== p)
                      }))} />
                    <span className="text-sm capitalize text-[#e6e1e1]">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h3 className="font-semibold text-[#e6e1e1] mb-4">Notifications</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#ff5473]"
              checked={form.emailNotifications !== false}
              onChange={e => setForm(f => ({ ...f, emailNotifications: e.target.checked }))} />
            <div>
              <p className="text-sm font-medium text-[#e6e1e1]">Email Notifications</p>
              <p className="text-xs text-[#e1bec0]">Receive emails for approvals and published posts</p>
            </div>
          </label>
        </div>

        {/* Claude API */}
        <div className="card p-6">
          <h3 className="font-semibold text-[#e6e1e1] mb-1">Claude API</h3>
          <p className="text-xs text-[#e1bec0] mb-4">Your key is stored server-side and never exposed in the browser.</p>
          <div className="space-y-4">
            <div>
              <label className="lbl">Model</label>
              <select className="sel" value={form.model || 'claude-sonnet-4-6'} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}>
                {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <button className="btn btn-o w-full flex items-center justify-center gap-2" disabled={testing} onClick={testClaude}>
              {testing ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Testing...</> : <><BeakerIcon className="w-4 h-4" /> Test Connection</>}
            </button>
            {testResult && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${testResult.ok ? 'bg-[rgba(34,197,94,0.1)] text-emerald-400 border border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(220,38,38,0.1)] text-[#f87171] border border-[rgba(220,38,38,0.2)]'}`}>
                {testResult.ok ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> : <XCircleIcon className="w-4 h-4 flex-shrink-0" />}
                {testResult.msg}
              </div>
            )}
          </div>
        </div>

        {/* Publishing */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <PaperAirplaneIcon className="w-4 h-4 text-[#ff5473]" />
            <h3 className="font-semibold text-[#e6e1e1]">Publishing — Buffer / Later</h3>
          </div>
          <p className="text-xs text-[#e1bec0] mb-4">Connect a Make.com webhook to push approved posts to Buffer or Later.</p>
          <div className="space-y-4">
            <div>
              <label className="lbl">Make.com Webhook URL</label>
              <input className="inp" placeholder="https://hook.eu1.make.com/..."
                value={form.makeWebhookUrl || ''} onChange={e => setForm(f => ({ ...f, makeWebhookUrl: e.target.value }))} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#ff5473]"
                checked={form.autoSendOnApprove || false}
                onChange={e => setForm(f => ({ ...f, autoSendOnApprove: e.target.checked }))} />
              <div>
                <p className="text-sm font-medium text-[#e6e1e1]">Auto-send to Buffer when approved</p>
                <p className="text-xs text-[#e1bec0]">Automatically push posts to Buffer as soon as you approve them</p>
              </div>
            </label>

            {/* Buffer Channels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="lbl mb-0">Buffer Channels</label>
                <button className="btn btn-o btn-sm flex items-center gap-1" onClick={() => setShowAddChannel(v => !v)}>
                  <PlusIcon className="w-3 h-3" /> Add Channel
                </button>
              </div>
              {(form.bufferChannels || []).length === 0 ? (
                <p className="text-xs text-[#5a4042] italic">No channels added yet.</p>
              ) : (
                <div className="space-y-1">
                  {(form.bufferChannels || []).map(ch => (
                    <div key={ch.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-[#2b2a29]">
                      <span className="text-sm text-[#e6e1e1]"><strong>{ch.name}</strong> <span className="text-xs text-[#e1bec0]">{ch.service}{ch.bufferId ? ' · ' + ch.bufferId : ''}</span></span>
                      <button className="text-xs text-[#f87171] hover:text-red-400 ml-2" onClick={() => removeChannel(ch.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
              {showAddChannel && (
                <div className="mt-2 p-3 border border-[rgba(90,64,66,0.3)] rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="lbl text-xs">Channel Name *</label>
                      <input className="inp" placeholder="e.g. Brand A Instagram" value={newChannel.name} onChange={e => setNewChannel(c => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="lbl text-xs">Platform *</label>
                      <select className="sel" value={newChannel.service} onChange={e => setNewChannel(c => ({ ...c, service: e.target.value }))}>
                        {CHANNEL_SERVICES.map(s => <option key={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="lbl text-xs">Buffer Profile ID <span className="text-[#5a4042]">(optional)</span></label>
                    <input className="inp" placeholder="Found in Buffer channel settings" value={newChannel.bufferId} onChange={e => setNewChannel(c => ({ ...c, bufferId: e.target.value }))} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="btn btn-o btn-sm" onClick={() => setShowAddChannel(false)}>Cancel</button>
                    <button className="btn btn-p btn-sm" onClick={addChannel}>Save Channel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replicate — AI Image Generation */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <BeakerIcon className="w-4 h-4 text-[#ff5473]" />
            <h3 className="font-semibold text-[#e6e1e1]">AI Image Generation — Replicate</h3>
          </div>
          <p className="text-xs text-[#e1bec0] mb-4">Required to train brand image models and generate AI photos in the Photo Library.</p>
          <div className="p-4 bg-[#2b2a29] rounded-lg space-y-2 text-sm">
            <p className="text-[#e6e1e1] font-medium">Setup instructions</p>
            <ol className="list-decimal list-inside space-y-1 text-[#e1bec0] text-xs">
              <li>Create an account at <span className="text-[#ffb2b9]">replicate.com</span></li>
              <li>Go to <span className="font-mono text-[#ffb2b9]">replicate.com/account/api-tokens</span> and create an API token</li>
              <li>Add the following line to your <span className="font-mono text-[#ffb2b9]">.env.local</span> file:</li>
            </ol>
            <div className="mt-2 p-2 bg-[#1c1b1b] rounded font-mono text-xs text-[#ffb2b9] select-all">
              REPLICATE_API_KEY=r8_your_token_here
            </div>
            <p className="text-xs text-[#5a4042] mt-1">Restart the dev server after adding the key. The key stays on your server — never exposed to the browser.</p>
          </div>
        </div>

        <button onClick={saveAll} className="btn btn-p w-full justify-center py-3 text-base flex items-center gap-2">
          <BookmarkIcon className="w-4 h-4" /> Save All Settings
        </button>
      </div>
    </div>
  )
}
