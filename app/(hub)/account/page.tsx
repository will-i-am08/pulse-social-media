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
  LinkIcon,
} from '@heroicons/react/16/solid'
import { bufferServiceIcon } from '@/lib/utils'

interface BufferProfile {
  id: string
  service: string
  formatted_service: string
  formatted_username: string
  avatar_https: string
}

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

  // Buffer state
  const [hasBufferToken, setHasBufferToken] = useState(false)
  const [bufferToken, setBufferToken] = useState('')
  const [showBufferToken, setShowBufferToken] = useState(false)
  const [savingBuffer, setSavingBuffer] = useState(false)
  const [removingBuffer, setRemovingBuffer] = useState(false)
  const [testingBuffer, setTestingBuffer] = useState(false)
  const [bufferProfiles, setBufferProfiles] = useState<BufferProfile[]>([])
  const [bufferTestResult, setBufferTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/account-settings')
      .then(r => r.json())
      .then(data => {
        setHasClaudeKey(data.hasClaudeKey ?? false)
        setHasBufferToken(data.hasBufferToken ?? false)
        setLoading(false)
        if (data.hasBufferToken) fetchBufferProfiles()
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
        body: JSON.stringify({ systemPrompt: 'You are a test assistant.', userContent: 'Reply with exactly: Connection successful', maxTokens: 50 }),
      })
      const data = await res.json()
      if (res.ok && data.text) {
        setTestResult({ ok: true, msg: data.text })
      } else {
        setTestResult({ ok: false, msg: data.error || 'Connection failed' })
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: 'Connection failed: ' + e.message })
    } finally {
      setTestingClaude(false)
    }
  }

  async function saveBufferToken() {
    if (!bufferToken.trim()) { toast.error('Enter your Buffer access token'); return }
    setSavingBuffer(true)
    setBufferTestResult(null)
    try {
      const res = await fetch('/api/account-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bufferToken: bufferToken.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
      setHasBufferToken(true)
      setBufferToken('')
      toast.success('Buffer access token saved!')
      fetchBufferProfiles()
    } catch (e: any) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSavingBuffer(false)
    }
  }

  async function removeBufferToken() {
    setRemovingBuffer(true)
    setBufferTestResult(null)
    setBufferProfiles([])
    try {
      await fetch('/api/account-settings?field=buffer', { method: 'DELETE' })
      setHasBufferToken(false)
      setBufferToken('')
      toast.success('Buffer access token removed')
    } catch {
      toast.error('Failed to remove token')
    } finally {
      setRemovingBuffer(false)
    }
  }

  async function fetchBufferProfiles() {
    setTestingBuffer(true)
    setBufferTestResult(null)
    try {
      const res = await fetch('/api/buffer')
      const data = await res.json()
      if (res.ok && data.profiles) {
        setBufferProfiles(data.profiles)
        setBufferTestResult({ ok: true, msg: `Connected — ${data.profiles.length} profile${data.profiles.length !== 1 ? 's' : ''} found` })
      } else {
        setBufferTestResult({ ok: false, msg: data.error || 'Connection failed' })
      }
    } catch (e: any) {
      setBufferTestResult({ ok: false, msg: 'Connection failed: ' + e.message })
    } finally {
      setTestingBuffer(false)
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

            {/* Buffer Integration */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon className="w-4 h-4 text-[#ff5473]" />
                <h3 className="font-semibold text-[#e6e1e1]">Buffer</h3>
                {hasBufferToken ? (
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-emerald-400 border border-[rgba(16,185,129,0.3)]">
                    Connected ✓
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(90,64,66,0.3)] text-[#e1bec0]">
                    Not connected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#e1bec0] mb-4">
                Connect your Buffer account to publish posts directly. Get your access token from{' '}
                <a href="https://buffer.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-[#ffb2b9] hover:underline">
                  buffer.com/developers
                </a>.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="lbl">
                    {hasBufferToken ? 'Replace access token' : 'Access token'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showBufferToken ? 'text' : 'password'}
                        className="inp w-full pr-9"
                        placeholder="1/..."
                        value={bufferToken}
                        onChange={e => setBufferToken(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveBufferToken()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowBufferToken(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a4042] hover:text-[#e1bec0] transition-colors"
                      >
                        {showBufferToken ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      className="btn btn-p whitespace-nowrap"
                      disabled={savingBuffer || !bufferToken.trim()}
                      onClick={saveBufferToken}
                    >
                      {savingBuffer ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-o flex items-center gap-2 flex-1 justify-center"
                    disabled={testingBuffer || !hasBufferToken}
                    onClick={fetchBufferProfiles}
                  >
                    {testingBuffer
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Testing...</>
                      : 'Test Connection'
                    }
                  </button>
                  {hasBufferToken && (
                    <button
                      className="btn btn-d"
                      disabled={removingBuffer}
                      onClick={removeBufferToken}
                    >
                      {removingBuffer ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Remove'}
                    </button>
                  )}
                </div>

                {bufferTestResult && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    bufferTestResult.ok
                      ? 'bg-[rgba(34,197,94,0.1)] text-emerald-400 border border-[rgba(34,197,94,0.2)]'
                      : 'bg-[rgba(220,38,38,0.1)] text-[#f87171] border border-[rgba(220,38,38,0.2)]'
                  }`}>
                    {bufferTestResult.ok
                      ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                      : <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                    }
                    {bufferTestResult.msg}
                  </div>
                )}

                {bufferProfiles.length > 0 && (
                  <div>
                    <label className="lbl">Connected Profiles</label>
                    <div className="space-y-1">
                      {bufferProfiles.map(p => (
                        <div key={p.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded bg-[#2b2a29]">
                          {p.avatar_https ? (
                            <img src={p.avatar_https} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                          ) : (
                            <span className="text-base flex-shrink-0">{bufferServiceIcon(p.service)}</span>
                          )}
                          <span className="text-sm text-[#e6e1e1] flex-1">
                            <strong>{p.formatted_username || p.service}</strong>{' '}
                            <span className="text-xs text-[#e1bec0]">{p.formatted_service}</span>
                          </span>
                        </div>
                      ))}
                    </div>
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
