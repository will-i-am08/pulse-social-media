'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  BoltIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

const SUPPORTED_AGENTS = ['Claude', 'ChatGPT', 'Perplexity', 'Gemini', 'Copilot']

export default function CommercePage() {
  const [enabled, setEnabled] = useState(false)
  const [acpEndpoint, setAcpEndpoint] = useState('')
  const [agents, setAgents] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Commerce Hub settings saved')
    setSaving(false)
  }

  function toggleAgent(agent: string) {
    setAgents(prev => prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent])
  }

  const inp = 'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Commerce Hub</h1>
        <p className="text-slate-400">Enable AI agents to browse and purchase products on your behalf via the Agentic Commerce Protocol</p>
      </div>

      {/* ACP toggle */}
      <div className="geo-glass p-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BoltIcon className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">AI Checkout (ACP)</span>
            </div>
            <p className="text-sm text-slate-400">Allow authorised AI agents to complete purchases on behalf of verified users</p>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ background: enabled ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: enabled ? 'translateX(26px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        {enabled && (
          <div className="mt-5 space-y-4 pt-5 border-t border-[rgba(255,255,255,0.06)]">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">ACP Endpoint URL</label>
              <input
                className={inp}
                placeholder="https://yourdomain.com/.well-known/acp.json"
                value={acpEndpoint}
                onChange={e => setAcpEndpoint(e.target.value)}
              />
              <p className="text-xs text-slate-600 mt-1">Agents will discover your ACP config at this URL</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Authorised Agents</label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_AGENTS.map(agent => (
                  <button
                    key={agent}
                    onClick={() => toggleAgent(agent)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={{
                      background: agents.includes(agent) ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                      borderColor: agents.includes(agent) ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
                      color: agents.includes(agent) ? '#a5b4fc' : '#64748b',
                    }}
                  >
                    {agents.includes(agent) && <CheckCircleIcon className="w-3 h-3 inline mr-1" />}
                    {agent}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex gap-3 p-3 rounded-lg bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)]">
              <InformationCircleIcon className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <p>The Agentic Commerce Protocol (ACP) is an emerging standard that lets AI assistants discover your product catalogue and complete purchases with user permission.</p>
                <p>Your <code className="text-indigo-400">.well-known/acp.json</code> file should declare your supported payment methods, product endpoints, and required user consent flows.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What is ACP */}
      <div className="geo-glass p-6 mb-5">
        <h3 className="font-semibold text-white mb-3">What is ACP?</h3>
        <div className="space-y-3 text-sm text-slate-400">
          <p>The <strong className="text-slate-300">Agentic Commerce Protocol</strong> enables AI agents (like Claude, ChatGPT, and Perplexity) to:</p>
          <ul className="space-y-1 pl-4">
            <li>• Discover your product catalogue automatically</li>
            <li>• Present your products when users ask relevant questions</li>
            <li>• Complete purchases on behalf of users who grant permission</li>
            <li>• Access real-time pricing, availability, and shipping info</li>
          </ul>
          <p className="text-slate-500 text-xs">ACP is an emerging standard. Implementation will vary by platform. Check your e-commerce platform docs for current support.</p>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white w-full justify-center"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', opacity: saving ? 0.7 : 1 }}
      >
        {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
        {saving ? 'Saving…' : 'Save Commerce Settings'}
      </button>
    </div>
  )
}
