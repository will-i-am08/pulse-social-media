'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowPathIcon, BookmarkIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid'

export default function ProfilePage() {
  const { profile, saveProfile } = useWorkspace()
  const router = useRouter()
  const [name, setName] = useState(profile.name)
  const [saving, setSaving] = useState(false)

  async function handleSignOut() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  useEffect(() => { setName(profile.name) }, [profile.name])

  async function handleSave() {
    setSaving(true)
    try {
      await saveProfile({ ...profile, name })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Profile</h1>
      <p className="text-[#e1bec0] mb-8">Manage your personal details</p>

      <div className="card p-6 space-y-5">
        <div>
          <label className="lbl">Display Name</label>
          <input
            className="inp"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="lbl">Email</label>
          <input className="inp" value={profile.email} disabled readOnly />
          <p className="text-xs text-[#5a4042] mt-1">Email can&apos;t be changed here</p>
        </div>
        <div>
          <label className="lbl">Role</label>
          <input className="inp capitalize" value={profile.role || 'admin'} disabled readOnly />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-p w-full justify-center flex items-center gap-2">
          {saving ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving...</> : <><BookmarkIcon className="w-4 h-4" /> Save Profile</>}
        </button>
        <button onClick={handleSignOut} className="btn btn-d w-full justify-center flex items-center gap-2">
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )
}
