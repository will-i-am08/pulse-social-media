'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

type Screen = 'login' | 'forgot' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const sb = createClient()
  const [screen, setScreen] = useState<Screen>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    setLoading(true)
    const { error: err } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/apps')
    router.refresh()
  }

  async function handleForgot() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    toast.success('Password reset email sent — check your inbox!')
    setScreen('login')
  }

  async function handleResetPassword() {
    setLoading(true)
    const { error: err } = await sb.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (err) { setError(err.message); return }
    toast.success('Password updated! Signing you in…')
    router.push('/apps')
  }

  return (
    <div className="min-h-screen bg-[#0f0e0e] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(255,84,115,0.06)_0%,_transparent_60%)]" />
      </div>
      <div className="login-card relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl thermal-gradient flex items-center justify-center text-white font-bold text-sm">CC</div>
            <div>
              <div className="font-bold text-lg thermal-gradient-text">CaptionCraft</div>
              <div className="text-xs text-[#5a4042]">Agency Content Platform</div>
            </div>
          </div>
        </div>

        {screen === 'login' && (
          <>
            <h2 className="text-2xl font-bold text-[#e6e1e1] mb-1">Welcome back</h2>
            <p className="text-sm text-[#e1bec0] mb-6">Sign in to your workspace</p>
            {error && (
              <div className="bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#f87171] rounded-lg px-3 py-2.5 text-sm mb-4">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="lbl">Email</label>
                <input
                  className="inp"
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="lbl">Password</label>
                <input
                  className="inp"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
              </div>
              <button
                className="btn btn-p w-full justify-center py-2.5"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-[#e1bec0]">
                <button
                  onClick={() => { setScreen('forgot'); setError('') }}
                  className="text-[#ffb2b9] hover:text-[#ff5473] hover:underline"
                >
                  Forgot password?
                </button>
              </p>
            </div>
          </>
        )}

        {screen === 'forgot' && (
          <>
            <h2 className="text-2xl font-bold text-[#e6e1e1] mb-1">Reset Password</h2>
            <p className="text-sm text-[#e1bec0] mb-6">Enter your email and we&apos;ll send a reset link</p>
            {error && (
              <div className="bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#f87171] rounded-lg px-3 py-2.5 text-sm mb-4">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="lbl">Email</label>
                <input
                  className="inp"
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgot()}
                />
              </div>
              <button className="btn btn-p w-full justify-center py-2.5" onClick={handleForgot} disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Email'}
              </button>
              <p className="text-center text-xs text-[#e1bec0]">
                <button onClick={() => { setScreen('login'); setError('') }} className="text-[#ffb2b9] hover:text-[#ff5473] hover:underline">
                  Back to Sign In
                </button>
              </p>
            </div>
          </>
        )}

        {screen === 'reset' && (
          <>
            <h2 className="text-2xl font-bold text-[#e6e1e1] mb-1">Set New Password</h2>
            <p className="text-sm text-[#e1bec0] mb-6">Enter your new password below</p>
            {error && (
              <div className="bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#f87171] rounded-lg px-3 py-2.5 text-sm mb-4">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="lbl">New Password</label>
                <input
                  className="inp"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
              <button className="btn btn-p w-full justify-center py-2.5" onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
