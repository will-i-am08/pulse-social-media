'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import Modal from '@/components/app/Modal'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import { uid } from '@/lib/utils'
import type { Client } from '@/lib/types'
import {
  UsersIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  KeyIcon,
} from '@heroicons/react/16/solid'

export default function ClientsPage() {
  const { clients, saveClients, brands, posts } = useWorkspace()
  const [modal, setModal] = useState<Partial<Client> | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function openNew() { setModal({ name: '', email: '', brand_profile_id: '', portal_password: '' }); setEditId(null) }
  function openEdit(c: Client) { setModal({ ...c }); setEditId(c.id) }
  function closeModal() { setModal(null); setEditId(null) }

  function saveClient() {
    if (!modal?.name?.trim()) { toast.error('Client name required'); return }
    const data = { ...modal, id: editId || uid(), created_date: editId ? undefined : new Date().toISOString() }
    if (editId) {
      saveClients(clients.map(c => c.id === editId ? { ...c, ...data } as Client : c))
      toast.success('Client updated!')
    } else {
      saveClients([data as Client, ...clients])
      toast.success('Client added!')
    }
    closeModal()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Clients</h1>
          <p className="text-[#e1bec0] mt-1">Manage client portals and access</p>
        </div>
        <button onClick={openNew} className="btn btn-p flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 text-[#e1bec0]">
          <UsersIcon className="w-12 h-12 mx-auto mb-3 text-[#5a4042]" />
          <p className="text-lg mb-2 text-[#e6e1e1]">No clients yet</p>
          <p className="text-sm mb-4">Add clients to give them a portal to review posts</p>
          <button onClick={openNew} className="btn btn-p">Add Client</button>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map(c => {
            const brand = brands.find(b => b.id === c.brand_profile_id)
            const clientPosts = posts.filter(p => p.brand_profile_id === c.brand_profile_id)
            const approvedPosts = clientPosts.filter(p => p.client_approved)
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,84,115,0.15)] flex items-center justify-center text-[#ff5473] font-bold flex-shrink-0">
                    {(c.name || 'C')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#e6e1e1]">{c.name}</h3>
                    <p className="text-sm text-[#e1bec0]">{c.email || 'No email'}</p>
                    {brand && (
                      <p className="text-xs text-[#e1bec0] mt-1 flex items-center gap-1">
                        <TagIcon className="w-3 h-3" /> Brand: {brand.name}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-[#e1bec0]">
                      <span className="flex items-center gap-1"><DocumentTextIcon className="w-3 h-3" /> {clientPosts.length} posts</span>
                      <span className="flex items-center gap-1"><HandThumbUpIcon className="w-3 h-3" /> {approvedPosts.length} approved</span>
                    </div>
                    {c.portal_password ? (
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><KeyIcon className="w-3 h-3" /> Portal access enabled</p>
                    ) : (
                      <p className="text-xs text-[#5a4042] mt-1">No portal access</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="btn btn-o btn-sm flex items-center gap-1">
                      <PencilSquareIcon className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} className="btn btn-d btn-sm">
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal onClose={closeModal}>
          <div className="modal">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#e6e1e1]">{editId ? 'Edit Client' : 'Add Client'}</h3>
              <button className="btn btn-o btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="lbl">Client Name *</label>
                <input className="inp" placeholder="Client name" value={modal.name || ''} onChange={e => setModal(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="lbl">Email</label>
                <input className="inp" type="email" placeholder="client@company.com" value={modal.email || ''} onChange={e => setModal(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="lbl">Linked Brand</label>
                <select className="sel" value={modal.brand_profile_id || ''} onChange={e => setModal(p => ({ ...p, brand_profile_id: e.target.value }))}>
                  <option value="">No brand linked</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Portal Password</label>
                <input className="inp" type="password" placeholder="Set portal access password" value={modal.portal_password || ''} onChange={e => setModal(p => ({ ...p, portal_password: e.target.value }))} />
                <p className="text-xs text-[#5a4042] mt-1">Clients use this password to access their portal</p>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button className="btn btn-o" onClick={closeModal}>Cancel</button>
                <button className="btn btn-p" onClick={saveClient}>Save</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Remove Client"
          description="This will remove the client from your workspace."
          onConfirm={() => { saveClients(clients.filter(c => c.id !== confirmDelete)); toast.success('Client removed'); setConfirmDelete(null) }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
