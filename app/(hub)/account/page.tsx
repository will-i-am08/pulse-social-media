'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  ArrowRightStartOnRectangleIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/16/solid'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasClaudeKey, setHasClaudeKey] = useState(false)
  const [claudeKey, setClaudeKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savingClaude, setSavingClaude] = useState(false)
  const [removingClaude, setRemovingClaude] = useState(false)
  const [testingClaude, setTestingClaude] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/account-settings')
      .then(r => r.json())
      .then(data => {
        setHasClaudeKey(data.hasClaudeKey ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function saveClaudeKey() {
    if (!claudeKey.trim()) { toast.error('Enter your Claude API key'); return }
    setSavingClaude(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/account-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claudeKey: claudeKey.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
      setHasClaudeKey(true)
      setClaudeKey('')
      toast.success('Claude API key saved!')
    } catch (e: any) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSavingClaude(false)
    }
  }

  async function removeClaudeKey() {
    setRemovingClaude(true)
    setTestResult(null)
    try {
      await fetch('/api/account-settings?field=claude', { method: 'DELETE' })
      setHasClaudeKey(false)
      setClaudeKey('')
      toast.success('Claude API key removed')
    } catch {
      toast.error('Failed to remove key')
    } finally {
      setRemovingClaude(false)
    }
  }

  async function testClaude() {
    setTestingClaude(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: 'You are a test assistant.', prompt: 'Reply with exactly: Connection successful', maxTokens: 50 }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setTestResult({ ok: true, msg: data.result })
      } else {
        setTestResult({ ok: false, msg: data.error || 'Connection failed' })
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: 'Connection failed: ' + e.message })
    } finally {
      setTestingClaude(false)
    }
  }

  async function handleSignOut() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f0e0e] flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(90,64,66,0.2)] px-6 py-4 flex items-center gap-4">
        <Link
          href="/apps"
          className="flex items-center gap-1.5 text-sm text-[#e1bec0] hover:text-[#ffb2b9] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Apps
        </Link>
        <div className="h-4 w-px bg-[rgba(90,64,66,0.4)]" />
        <span className="font-semibold text-[#e6e1e1]">Account Settings</span>
        <div className="flex-1" />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-[#e1bec0] hover:text-[#ffb2b9] transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Account Settings</h1>
          <p className="text-[#e1bec0] text-sm">Credentials and integrations shared across all your apps</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-[#e1bec0]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Claude AI */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <KeyIcon className="w-4 h-4 text-[#ff5473]" />
                <h3 className="font-semibold text-[#e6e1e1]">Claude AI</h3>
                {hasClaudeKey ? (
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-emerald-400 border border-[rgba(16,185,129,0.3)]">
                    Key saved ✓
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(90,64,66,0.3)] text-[#e1bec0]">
                    No key
                  </span>
                )}
              </div>
              <p className="text-xs text-[#e1bec0] mb-4">
                Your API key is encrypted and stored server-side. It's used by all apps: CaptionCraft, Blog Engine, Brand Research, and GEO.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="lbl">
                    {hasClaudeKey ? 'Replace API key' : 'API key'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        className="inp w-full pr-9"
                        placeholder="sk-ant-..."
                        value={claudeKey}
                        onChange={e => setClaudeKey(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveClaudeKey()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a4042] hover:text-[#e1bec0] transition-colors"
                      >
                        {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      className="btn btn-p whitespace-nowrap"
                      disabled={savingClaude || !claudeKey.trim()}
                      onClick={saveClaudeKey}
                    >
                      {savingClaude ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-o flex items-center gap-2 flex-1 justify-center"
                    disabled={testingClaude || !hasClaudeKey}
                    onClick={testClaude}
                  >
                    {testingClaude
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Testing...</>
                      : 'Test Connection'
                    }
                  </button>
                  {hasClaudeKey && (
                    <button
                      className="btn btn-d"
                      disabled={removingClaude}
                      onClick={removeClaudeKey}
                    >
                      {removingClaude ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Remove'}
                    </button>
                  )}
                </div>

                {testResult && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    testResult.ok
                      ? 'bg-[rgba(34,197,94,0.1)] text-emerald-400 border border-[rgba(34,197,94,0.2)]'
                      : 'bg-[rgba(220,38,38,0.1)] text-[#f87171] border border-[rgba(220,38,38,0.2)]'
                  }`}>
                    {testResult.ok
                      ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                      : <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                    }
                    {testResult.msg}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
