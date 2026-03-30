'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import Modal from '@/components/app/Modal'
import { uid } from '@/lib/utils'
import { uploadImage } from '@/lib/supabase/storage'
import type { Photo, Folder } from '@/lib/types'
import {
  FolderIcon,
  FolderOpenIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/16/solid'

export default function PhotosPage() {
  const { photos, savePhotos, folders, saveFolders } = useWorkspace()
  const [filter, setFilter] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderModal, setFolderModal] = useState(false)

  const filtered = photos.filter(p => {
    const sm = !filter || p.name?.toLowerCase().includes(filter.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(filter.toLowerCase()))
    const fm = folderId === null || p.folder_id === folderId
    return sm && fm
  })

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const fileArr = Array.from(files)
    setUploading(true)
    setUploadProgress({ done: 0, total: fileArr.length })
    const newPhotos: Photo[] = []
    let failed = 0
    // Upload in batches of 3 for speed without overwhelming the server
    for (let i = 0; i < fileArr.length; i += 3) {
      const batch = fileArr.slice(i, i + 3)
      const results = await Promise.allSettled(
        batch.map(async (file) => {
          const url = await uploadImage(file)
          return { id: uid(), url, name: file.name.replace(/\.[^.]+$/, ''), tags: [] as string[], folder_id: folderId, created_date: new Date().toISOString() } as Photo
        })
      )
      for (const r of results) {
        if (r.status === 'fulfilled') newPhotos.push(r.value)
        else failed++
      }
      setUploadProgress({ done: Math.min(i + batch.length, fileArr.length), total: fileArr.length })
    }
    if (newPhotos.length > 0) {
      savePhotos([...newPhotos, ...photos])
    }
    setUploading(false)
    if (newPhotos.length > 0) toast.success(`${newPhotos.length} photo${newPhotos.length !== 1 ? 's' : ''} uploaded!`)
    if (failed > 0) toast.error(`${failed} upload${failed !== 1 ? 's' : ''} failed`)
  }

  function renamePhoto(id: string, name: string) {
    savePhotos(photos.map(p => p.id === id ? { ...p, name } : p))
  }

  function addTag(id: string, tag: string) {
    if (!tag.trim()) return
    savePhotos(photos.map(p => p.id === id ? { ...p, tags: [...(p.tags || []), tag.trim()] } : p))
  }

  function removeTag(id: string, tag: string) {
    savePhotos(photos.map(p => p.id === id ? { ...p, tags: (p.tags || []).filter(t => t !== tag) } : p))
  }

  function moveToFolder(id: string, fid: string) {
    savePhotos(photos.map(p => p.id === id ? { ...p, folder_id: fid || null } : p))
  }

  function deletePhoto(id: string) {
    savePhotos(photos.filter(p => p.id !== id))
    toast.success('Photo deleted')
  }

  function createFolder() {
    if (!newFolderName.trim()) return
    saveFolders([...folders, { id: uid(), name: newFolderName.trim() }])
    setNewFolderName('')
    setFolderModal(false)
    toast.success('Folder created')
  }

  function deleteFolder(id: string) {
    saveFolders(folders.filter(f => f.id !== id))
    savePhotos(photos.map(p => p.folder_id === id ? { ...p, folder_id: null } : p))
    toast.success('Folder deleted')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Photo Library</h1>
          <p className="text-[#e1bec0] mt-1">Manage your brand assets</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-o btn-sm flex items-center gap-1" onClick={() => setFolderModal(true)}>
            <FolderIcon className="w-4 h-4" /> New Folder
          </button>
          <label className={`btn btn-p cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            {uploading ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Uploading {uploadProgress.done}/{uploadProgress.total}...</> : <><PaperClipIcon className="w-4 h-4" /> Upload</>}
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => { handleUpload(e.target.files); e.target.value = '' }} />
          </label>
        </div>
      </div>

      {/* Search + folders */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4042]" />
          <input className="inp pl-9" style={{ maxWidth: 240 }} placeholder="Search photos..."
            value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFolderId(null)} className={`btn btn-sm flex items-center gap-1 ${folderId === null ? 'btn-p' : 'btn-o'}`}>
            <FolderOpenIcon className="w-4 h-4" /> All Photos ({photos.length})
          </button>
          {folders.map(f => (
            <button key={f.id} onClick={() => setFolderId(f.id)} className={`btn btn-sm flex items-center gap-1 ${folderId === f.id ? 'btn-p' : 'btn-o'}`}>
              <FolderIcon className="w-4 h-4" /> {f.name}
              <span onClick={e => { e.stopPropagation(); deleteFolder(f.id) }} className="ml-1 text-[#f87171] hover:text-red-400">×</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#e1bec0]">
          <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-[#5a4042]" />
          <p className="text-lg mb-2 text-[#e6e1e1]">No photos yet</p>
          <p className="text-sm mb-4">Upload photos to use in your posts</p>
          <label className="btn btn-p cursor-pointer flex items-center gap-2 mx-auto w-fit">
            <PaperClipIcon className="w-4 h-4" /> Upload Photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
          </label>
        </div>
      ) : (
        <div className="photo-grid">
          {filtered.map(photo => {
            const folder = folders.find(f => f.id === photo.folder_id)
            return (
              <div key={photo.id} className="card overflow-hidden group">
                <div className="relative">
                  <img src={photo.url} alt={photo.name} className="w-full h-36 object-cover cursor-pointer" onClick={() => setLightbox(photo)} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="btn btn-sm btn-o" onClick={() => setLightbox(photo)}>
                      <EyeIcon className="w-3 h-3" />
                    </button>
                    <button className="btn btn-sm btn-d" onClick={() => setConfirmDelete(photo.id)}>
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <input
                    className="text-xs w-full bg-transparent outline-none font-medium text-[#e6e1e1]"
                    defaultValue={photo.name || 'Photo'}
                    onBlur={e => renamePhoto(photo.id, e.target.value)}
                  />
                  {folder && (
                    <p className="text-xs text-[#e1bec0] flex items-center gap-1">
                      <FolderIcon className="w-3 h-3" /> {folder.name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(photo.tags || []).map(tag => (
                      <span key={tag} className="text-xs bg-[rgba(255,84,115,0.15)] text-[#ffb2b9] px-1.5 rounded-full cursor-pointer hover:bg-[rgba(255,84,115,0.25)]"
                        onClick={() => removeTag(photo.id, tag)}>{tag} ×</span>
                    ))}
                    <input
                      className="text-xs bg-transparent outline-none text-[#5a4042] w-16"
                      placeholder="+tag"
                      onKeyDown={e => { if (e.key === 'Enter') { addTag(photo.id, e.currentTarget.value); e.currentTarget.value = '' } }}
                    />
                  </div>
                  {folders.length > 0 && (
                    <select className="sel mt-1" style={{ fontSize: 11, padding: '2px 6px' }} value={photo.folder_id || ''} onChange={e => moveToFolder(photo.id, e.target.value)}>
                      <option value="">Move to folder...</option>
                      {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Modal onClose={() => setLightbox(null)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#e6e1e1]">{lightbox.name}</h3>
              <button className="btn btn-o btn-sm" onClick={() => setLightbox(null)}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.name} className="w-full rounded-lg max-h-[60vh] object-contain" />
          </div>
        </Modal>
      )}

      {/* New folder modal */}
      {folderModal && (
        <Modal onClose={() => setFolderModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 className="text-lg font-semibold mb-4 text-[#e6e1e1]">New Folder</h3>
            <input className="inp mb-4" placeholder="Folder name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFolder() }} autoFocus />
            <div className="flex gap-3 justify-end">
              <button className="btn btn-o" onClick={() => setFolderModal(false)}>Cancel</button>
              <button className="btn btn-p" onClick={createFolder}>Create</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Photo"
          description="This will permanently delete this photo."
          onConfirm={() => { deletePhoto(confirmDelete!); setConfirmDelete(null) }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
