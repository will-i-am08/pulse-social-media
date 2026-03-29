'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useWorkspace } from '@/context/WorkspaceContext'
import Modal from '@/components/app/Modal'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import { PlusIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/16/solid'

interface Member {
  id: string
  email: string
  display_name?: string
  role: string
  brand_id?: string
}

export default function TeamPage() {
  const { profile, brands } = useWorkspace()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('team')
  const [inviteBrand, setInviteBrand] = useState('')
  const [inviting, setInviting] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const sb = createClient()
      const { data: { session } } = await sb.auth.getSession()
      const res = await fetch('/api/admin-users?action=list', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      if (!res.ok) throw new Error(await res.text())
      setMembers(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  async function sendInvite() {
    if (!inviteEmail) { toast.error('Email required'); return }
    setInviting(true)
    try {
      const sb = createClient()
      const { data: { session } } = await sb.auth.getSession()
      const res = await fetch('/api/admin-users?action=invite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, brand_id: inviteRole === 'client' ? inviteBrand || null : null })
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Invite failed') }
      toast.success('Invite sent to ' + inviteEmail + '!')
      setInviteModal(false)
      setInviteEmail('')
      loadMembers()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setInviting(false)
    }
  }

  async function removeMember(userId: string) {
    try {
      const sb = createClient()
      const { data: { session } } = await sb.auth.getSession()
      const res = await fetch('/api/admin-users?action=remove', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Remove failed') }
      toast.success('Member removed')
      loadMembers()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Team</h1>
          <p className="text-[#e1bec0] mt-1">Manage team members and client access</p>
        </div>
        <button onClick={() => setInviteModal(true)} className="btn btn-p flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Admin (you) */}
      <div className="card p-4 mb-4 border-[rgba(255,84,115,0.2)] bg-[rgba(255,84,115,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full thermal-gradient flex items-center justify-center text-white font-bold">
            {(profile.name || 'U')[0]}
          </div>
          <div>
            <p className="font-semibold text-[#e6e1e1]">{profile.name || 'You'}</p>
            <p className="text-sm text-[#e1bec0]">{profile.email}</p>
          </div>
          <span className="badge bd-sub ml-auto">Admin</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#e1bec0]">
          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-3 text-[#ff5473]" />
          <p className="text-sm">Loading workspace members…</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-[#e1bec0]">
          <p className="mb-1">Could not load team members.</p>
          <p className="text-xs">{error}</p>
          <button onClick={loadMembers} className="btn btn-o btn-sm mt-3">Retry</button>
        </div>
      ) : members.length === 0 ? (
        <div className="card p-8 text-center text-[#e1bec0]">
          <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-[#5a4042]" />
          <p className="text-lg mb-2 text-[#e6e1e1]">No team members or clients yet</p>
          <p className="text-sm mb-4">Invite team members to collaborate, or give clients a read-only portal</p>
          <button onClick={() => setInviteModal(true)} className="btn btn-p flex items-center gap-2 mx-auto">
            <PlusIcon className="w-4 h-4" /> Invite User
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => {
            const brandName = m.brand_id ? brands.find(b => b.id === m.brand_id)?.name || 'Unknown brand' : ''
            const badge = m.role === 'team' ? 'bd-sub' : m.role === 'client' ? 'bd-app' : 'bd-gray'
            const label = m.role === 'team' ? 'Team' : m.role === 'client' ? 'Client' : m.role
            return (
              <div key={m.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2b2a29] flex items-center justify-center font-bold text-[#e1bec0]">
                  {(m.display_name || m.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#e6e1e1]">{m.display_name || 'Pending invite'}</p>
                  <p className="text-sm text-[#e1bec0]">{m.email}{brandName ? ` · ${brandName}` : ''}</p>
                </div>
                <span className={`badge ${badge}`}>{label}</span>
                <button onClick={() => setConfirmRemove(m.id)} className="btn btn-d btn-sm">Remove</button>
              </div>
            )
          })}
        </div>
      )}

      {inviteModal && (
        <Modal onClose={() => setInviteModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#e6e1e1]">Invite User</h3>
              <button className="btn btn-o btn-sm" onClick={() => setInviteModal(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="lbl">Email *</label>
                <input className="inp" type="email" placeholder="user@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div>
                <label className="lbl">Role</label>
                <select className="sel" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="team">Team Member — full app access</option>
                  <option value="client">Client — view their brand&apos;s approved posts only</option>
                </select>
              </div>
              {inviteRole === 'client' && (
                <div>
                  <label className="lbl">Assigned Brand</label>
                  <select className="sel" value={inviteBrand} onChange={e => setInviteBrand(e.target.value)}>
                    {brands.length === 0 ? <option value="">— Create a brand first —</option> : brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <p className="text-xs text-[#e1bec0]">They&apos;ll receive an email invitation to set their password and log in.</p>
              <div className="flex gap-3 justify-end pt-2">
                <button className="btn btn-o" onClick={() => setInviteModal(false)}>Cancel</button>
                <button className="btn btn-p flex items-center gap-2" disabled={inviting} onClick={sendInvite}>
                  {inviting ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="Remove this member?"
          description="They will immediately lose access to the workspace."
          onConfirm={() => { removeMember(confirmRemove!); setConfirmRemove(null) }}
          onClose={() => setConfirmRemove(null)}
        />
      )}
    </div>
  )
}
