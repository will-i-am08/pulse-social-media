'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { uid } from '@/lib/utils'
import toast from 'react-hot-toast'
import Modal from '@/components/app/Modal'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import PhotoEditor from '@/app/(creative-studio)/creative-studio/PhotoEditor'
import type { Photo } from '@/lib/types'
import {
  FolderIcon,
  FolderPlusIcon,
  PhotoIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  PaperClipIcon,
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from '@heroicons/react/16/solid'

export default function PhotoLibrary() {
  const { photos, savePhotos, folders, saveFolders, brands, posts } = useWorkspace()

  // ── Usage badge tracking ────────────────────────────────────────────────────
  const [blogImageUrls, setBlogImageUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    createClient()
      .from('posts')
      .select('data')
      .eq('data->>type', 'blog')
      .then(({ data }) => {
        if (!data) return
        const urls = new Set<string>()
        for (const row of data) {
          if (row.data?.featured_image) urls.add(row.data.featured_image)
        }
        setBlogImageUrls(urls)
      })
  }, [])

  const postImageUrls = useMemo(() => {
    const urls = new Set<string>()
    for (const p of posts) {
      if (p.image_url) urls.add(p.image_url)
      if (p.image_urls) p.image_urls.forEach((u: string) => urls.add(u))
    }
    return urls
  }, [posts])

  const allUsedUrls = useMemo(
    () => new Set([...postImageUrls, ...blogImageUrls]),
    [postImageUrls, blogImageUrls]
  )

  const usedPhotoNames = useMemo(() => {
    const names = new Set<string>()
    for (const photo of photos) {
      if (allUsedUrls.has(photo.url)) names.add(photo.name?.toLowerCase().trim())
    }
    return names
  }, [photos, allUsedUrls])

  function getUsageType(photo: Photo): 'post' | 'blog' | 'duplicate' | null {
    if (postImageUrls.has(photo.url)) return 'post'
    if (blogImageUrls.has(photo.url)) return 'blog'
    const name = photo.name?.toLowerCase().trim()
    if (name && usedPhotoNames.has(name) && !allUsedUrls.has(photo.url)) return 'duplicate'
    return null
  }

  // ── State ───────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null)

  // Folder state
  const [folderModal, setFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderBrandId, setNewFolderBrandId] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [folderSettingsId, setFolderSettingsId] = useState<string | null>(null)
  const [folderSettingsBrandId, setFolderSettingsBrandId] = useState('')

  // ── Filtered photos ─────────────────────────────────────────────────────────
  const filtered = photos.filter(p => {
    if (activeFolder && p.folder_id !== activeFolder) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
      if (!imageFiles.length) return
      setUploading(true)
      setUploadProgress({ done: 0, total: imageFiles.length })
      const newPhotos: Photo[] = []
      let failed = 0
      for (let i = 0; i < imageFiles.length; i += 3) {
        const batch = imageFiles.slice(i, i + 3)
        const results = await Promise.allSettled(
          batch.map(async file => {
            const url = await uploadImage(file)
            return {
              id: uid(),
              url,
              name: file.name.replace(/\.[^.]+$/, ''),
              tags: [] as string[],
              folder_id: activeFolder,
              created_date: new Date().toISOString(),
            } as Photo
          })
        )
        for (const r of results) {
          if (r.status === 'fulfilled') newPhotos.push(r.value)
          else failed++
        }
        setUploadProgress({ done: Math.min(i + batch.length, imageFiles.length), total: imageFiles.length })
      }
      if (newPhotos.length > 0) savePhotos([...newPhotos, ...photos])
      setUploading(false)
      if (newPhotos.length > 0) toast.success(`${newPhotos.length} photo${newPhotos.length !== 1 ? 's' : ''} uploaded!`)
      if (failed > 0) toast.error(`${failed} upload${failed !== 1 ? 's' : ''} failed`)
    },
    [photos, savePhotos, activeFolder]
  )

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true) }
  function handleDragLeave() { setDragOver(false) }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  // ── Photo actions ───────────────────────────────────────────────────────────
  function renamePhoto(id: string, name: string) {
    if (!name.trim()) return
    savePhotos(photos.map(p => p.id === id ? { ...p, name: name.trim() } : p))
  }

  function addTag(id: string, tag: string) {
    if (!tag.trim()) return
    savePhotos(photos.map(p =>
      p.id === id ? { ...p, tags: [...new Set([...(p.tags || []), tag.trim().toLowerCase()])] } : p
    ))
  }

  function removeTag(id: string, tag: string) {
    savePhotos(photos.map(p =>
      p.id === id ? { ...p, tags: (p.tags || []).filter(t => t !== tag) } : p
    ))
  }

  function moveToFolder(photoIds: string[], folderId: string | null) {
    savePhotos(photos.map(p => photoIds.includes(p.id) ? { ...p, folder_id: folderId } : p))
    setSelected(new Set())
  }

  function deletePhotos(ids: string[]) {
    savePhotos(photos.filter(p => !ids.includes(p.id)))
    setSelected(new Set())
    setConfirmDelete(null)
    toast.success(`${ids.length} photo${ids.length !== 1 ? 's' : ''} deleted`)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function handleEditorSave(url: string, photoId: string) {
    const original = photos.find(p => p.id === photoId)
    savePhotos([
      {
        id: uid(),
        url,
        name: (original?.name || 'Edited') + ' (edited)',
        tags: [...(original?.tags || []), 'edited'],
        folder_id: original?.folder_id || null,
        created_date: new Date().toISOString(),
      },
      ...photos,
    ])
    setEditingPhoto(null)
    toast.success('Edited photo saved to library')
  }

  // ── Folder actions ──────────────────────────────────────────────────────────
  function createFolder() {
    if (!newFolderName.trim()) return
    saveFolders([...folders, { id: uid(), name: newFolderName.trim(), brand_id: newFolderBrandId || null }])
    setNewFolderName(''); setNewFolderBrandId(''); setFolderModal(false)
    toast.success('Folder created')
  }

  function deleteFolder(id: string) {
    saveFolders(folders.filter(f => f.id !== id))
    savePhotos(photos.map(p => p.folder_id === id ? { ...p, folder_id: null } : p))
    if (activeFolder === id) setActiveFolder(null)
    toast.success('Folder deleted')
  }

  function renameFolder(id: string, name: string) {
    if (!name.trim()) return
    saveFolders(folders.map(f => f.id === id ? { ...f, name: name.trim() } : f))
  }

  function saveFolderSettings() {
    if (!folderSettingsId) return
    saveFolders(folders.map(f =>
      f.id === folderSettingsId ? { ...f, brand_id: folderSettingsBrandId || null } : f
    ))
    setFolderSettingsId(null)
    toast.success('Folder updated')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-48px)]">

      {/* ── Folder Sidebar ── */}
      <div
        className="w-52 flex-shrink-0 border-r p-3 space-y-1 overflow-y-auto"
        style={{ borderColor: 'rgba(255,84,115,0.1)', background: '#111015' }}
      >
        <button
          onClick={() => setActiveFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            !activeFolder ? 'text-[#ff5473]' : 'text-[#9ca3af] hover:text-[#e5e7eb]'
          }`}
          style={!activeFolder ? { background: 'rgba(255,84,115,0.12)' } : {}}
        >
          <PhotoIcon className="w-4 h-4" />
          All Photos
          <span className="ml-auto text-xs opacity-60">{photos.length}</span>
        </button>

        {folders.map(f => {
          const isEditing = editingFolderId === f.id
          const fb = f.brand_id ? brands.find(b => b.id === f.brand_id) : null
          return (
            <div key={f.id} className="group flex items-center gap-0.5">
              <button
                onClick={() => { if (!isEditing) setActiveFolder(f.id) }}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors min-w-0 ${
                  activeFolder === f.id ? 'text-[#ff5473]' : 'text-[#9ca3af] hover:text-[#e5e7eb]'
                }`}
                style={activeFolder === f.id ? { background: 'rgba(255,84,115,0.12)' } : {}}
              >
                <FolderIcon className="w-4 h-4 flex-shrink-0" />
                {isEditing ? (
                  <input
                    autoFocus
                    className="bg-transparent outline-none flex-1 min-w-0 text-sm"
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onBlur={() => { renameFolder(f.id, editingFolderName); setEditingFolderId(null) }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { renameFolder(f.id, editingFolderName); setEditingFolderId(null) }
                      if (e.key === 'Escape') setEditingFolderId(null)
                    }}
                  />
                ) : (
                  <span
                    className="truncate flex-1"
                    onDoubleClick={e => {
                      e.stopPropagation()
                      setEditingFolderId(f.id)
                      setEditingFolderName(f.name)
                    }}
                    title="Double-click to rename"
                  >
                    {f.name}
                  </span>
                )}
                {fb && (
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: fb.color || '#ff5473' }}
                    title={fb.name}
                  />
                )}
                <span className="ml-auto text-xs opacity-60">
                  {photos.filter(p => p.folder_id === f.id).length}
                </span>
              </button>
              {/* Cog (folder settings) */}
              <button
                onClick={() => { setFolderSettingsId(f.id); setFolderSettingsBrandId(f.brand_id || '') }}
                className="p-1 opacity-0 group-hover:opacity-100 text-[#9ca3af] hover:text-white transition-opacity"
                title="Folder settings"
              >
                <Cog6ToothIcon className="w-3.5 h-3.5" />
              </button>
              {/* Delete folder */}
              <button
                onClick={() => deleteFolder(f.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-opacity"
                title="Delete folder"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setFolderModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#ff5473] transition-colors"
        >
          <FolderPlusIcon className="w-4 h-4" /> New Folder
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b flex-wrap"
          style={{ borderColor: 'rgba(255,84,115,0.1)' }}
        >
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              className="inp pl-9 w-full"
              placeholder="Search photos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <label className={`btn btn-p cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            {uploading
              ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />{uploadProgress.done}/{uploadProgress.total}</>
              : <><PaperClipIcon className="w-4 h-4" />Upload</>
            }
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }}
            />
          </label>

          {selected.size > 0 && (
            <>
              <span className="text-xs text-[#ff5473]">{selected.size} selected</span>
              {folders.length > 0 && (
                <select
                  className="sel text-xs py-1"
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) moveToFolder([...selected], e.target.value === '__none__' ? null : e.target.value)
                    e.target.value = ''
                  }}
                >
                  <option value="" disabled>Move to...</option>
                  <option value="__none__">No folder</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              )}
              <button
                onClick={() => setConfirmDelete([...selected])}
                className="btn btn-d btn-sm flex items-center gap-1"
              >
                <TrashIcon className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => setSelected(new Set())} className="btn btn-o btn-sm">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Photo Grid */}
        <div
          ref={dropRef}
          className={`flex-1 overflow-y-auto p-4 ${dragOver ? 'ring-2 ring-[#ff5473] ring-inset' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6b7280]">
              <PhotoIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-[#e5e7eb]">
                {search ? 'No matching photos' : 'No photos yet'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term' : 'Upload images or drag & drop here'}
              </p>
              {!search && (
                <label className="btn btn-p mt-4 cursor-pointer flex items-center gap-2">
                  <PaperClipIcon className="w-4 h-4" /> Upload Photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) handleFiles(e.target.files) }} />
                </label>
              )}
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {filtered.map(photo => {
                const isSelected = selected.has(photo.id)
                const folder = folders.find(f => f.id === photo.folder_id)
                const usageType = getUsageType(photo)
                return (
                  <div
                    key={photo.id}
                    className={`group relative rounded-xl overflow-hidden border transition-all ${
                      isSelected
                        ? 'border-[#ff5473] ring-1 ring-[#ff5473]'
                        : 'border-[rgba(255,84,115,0.1)] hover:border-[rgba(255,84,115,0.3)]'
                    }`}
                    style={{ background: '#1a1920' }}
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setLightbox(photo)}>
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Usage badge */}
                    {usageType && (
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          usageType === 'post' ? 'bg-[#ff5473] text-white' :
                          usageType === 'blog' ? 'bg-purple-500 text-white' :
                          'bg-amber-500 text-white'
                        }`}>
                          {usageType === 'post' ? 'Used in post' : usageType === 'blog' ? 'Used in blog' : 'Duplicate'}
                        </span>
                      </div>
                    )}

                    {/* Select checkbox */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleSelect(photo.id) }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#ff5473] text-white'
                          : 'bg-black/40 text-white/60 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>

                    {/* Hover action buttons */}
                    <div className="absolute bottom-[100px] right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); setEditingPhoto(photo) }}
                        className="w-7 h-7 rounded-md bg-black/60 backdrop-blur text-white/80 hover:text-white flex items-center justify-center"
                        title="Edit photo"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setLightbox(photo) }}
                        className="w-7 h-7 rounded-md bg-black/60 backdrop-blur text-white/80 hover:text-white flex items-center justify-center"
                        title="Preview"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete([photo.id]) }}
                        className="w-7 h-7 rounded-md bg-black/60 backdrop-blur text-red-400/80 hover:text-red-400 flex items-center justify-center"
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info panel */}
                    <div className="p-2.5">
                      {/* Inline rename */}
                      <input
                        className="text-xs w-full bg-transparent outline-none font-medium text-[#e5e7eb] hover:text-white focus:text-white cursor-text"
                        defaultValue={photo.name || 'Photo'}
                        onBlur={e => renamePhoto(photo.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        title="Click to rename"
                      />
                      {folder && (
                        <p className="text-xs text-[#6b7280] flex items-center gap-1 mt-0.5">
                          <FolderIcon className="w-3 h-3" /> {folder.name}
                        </p>
                      )}
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(photo.tags || []).map(t => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,84,115,0.1)] text-[#ffb2b9] cursor-pointer hover:bg-[rgba(255,84,115,0.25)] flex items-center gap-0.5"
                            onClick={e => { e.stopPropagation(); removeTag(photo.id, t) }}
                            title="Click to remove"
                          >
                            {t} <XMarkIcon className="w-2.5 h-2.5" />
                          </span>
                        ))}
                        <input
                          className="text-[10px] bg-transparent border border-[rgba(255,84,115,0.2)] rounded-full px-1.5 py-0.5 text-[#ffb2b9] w-14 outline-none placeholder-[#5a4042] focus:border-[rgba(255,84,115,0.5)]"
                          placeholder="+tag"
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { addTag(photo.id, e.currentTarget.value); e.currentTarget.value = '' }
                          }}
                        />
                      </div>
                      {/* Move to folder */}
                      {folders.length > 0 && (
                        <select
                          className="sel mt-1.5 w-full"
                          style={{ fontSize: 11, padding: '2px 6px' }}
                          value={photo.folder_id || ''}
                          onChange={e => moveToFolder([photo.id], e.target.value || null)}
                          onClick={e => e.stopPropagation()}
                        >
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
        </div>
      </div>

      {/* ── Lightbox ── */}
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

      {/* ── Photo Editor ── */}
      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto}
          onSave={url => handleEditorSave(url, editingPhoto.id)}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      {/* ── New Folder Modal ── */}
      {folderModal && (
        <Modal onClose={() => setFolderModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 className="text-lg font-semibold mb-4 text-[#e6e1e1]">New Folder</h3>
            <input
              className="inp mb-3"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <select className="sel mb-4" value={newFolderBrandId} onChange={e => setNewFolderBrandId(e.target.value)}>
              <option value="">No brand (general folder)</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button className="btn btn-o" onClick={() => setFolderModal(false)}>Cancel</button>
              <button className="btn btn-p" onClick={createFolder}>Create</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Folder Settings Modal ── */}
      {folderSettingsId && (() => {
        const f = folders.find(x => x.id === folderSettingsId)
        if (!f) return null
        return (
          <Modal onClose={() => setFolderSettingsId(null)}>
            <div className="modal" style={{ maxWidth: 400 }}>
              <h3 className="text-lg font-semibold mb-1 text-[#e6e1e1]">Folder Settings</h3>
              <p className="text-xs text-[#6b7280] mb-4">{f.name}</p>
              <label className="text-xs text-[#e1bec0] block mb-1">Linked Brand</label>
              <select className="sel mb-2" value={folderSettingsBrandId} onChange={e => setFolderSettingsBrandId(e.target.value)}>
                <option value="">No brand linked</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <p className="text-xs text-[#6b7280] mb-6">
                Linking a brand lets you use this folder in automations to auto-generate posts on a schedule.
              </p>
              <div className="flex gap-3 justify-end">
                <button className="btn btn-o" onClick={() => setFolderSettingsId(null)}>Cancel</button>
                <button className="btn btn-p" onClick={saveFolderSettings}>Save</button>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* ── Confirm Delete ── */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${confirmDelete.length > 1 ? confirmDelete.length + ' Photos' : 'Photo'}`}
          description={`This will permanently delete ${confirmDelete.length > 1 ? 'these photos' : 'this photo'}.`}
          onConfirm={() => deletePhotos(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
