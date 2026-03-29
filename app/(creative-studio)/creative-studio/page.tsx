'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uploadImage } from '@/lib/supabase/storage'
import { uid } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Photo, Folder } from '@/lib/types'
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  FolderPlusIcon,
  TagIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  PlusIcon,
} from '@heroicons/react/16/solid'
import PhotoEditor from './PhotoEditor'

// ─── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/60 hover:text-white z-50">
        <XMarkIcon className="w-8 h-8" />
      </button>
      <img
        src={photo.url}
        alt={photo.name}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white font-medium">{photo.name}</p>
        {photo.tags.length > 0 && (
          <div className="flex gap-1 mt-1 justify-center">
            {photo.tags.map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/70">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Library Page ─────────────────────────────────────────────────────
export default function LibraryPage() {
  const { photos, savePhotos, folders, saveFolders } = useWorkspace()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [tagging, setTagging] = useState<string | null>(null)
  const [tagVal, setTagVal] = useState('')
  const [newFolder, setNewFolder] = useState(false)
  const [folderName, setFolderName] = useState('')


  // Filter photos
  const filtered = photos.filter(p => {
    if (activeFolder && p.folder_id !== activeFolder) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  // Upload
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    setUploading(true)
    const newPhotos: Photo[] = []
    for (const file of imageFiles) {
      try {
        const url = await uploadImage(file)
        newPhotos.push({
          id: uid(),
          url,
          name: file.name.replace(/\.[^.]+$/, ''),
          tags: [],
          folder_id: activeFolder,
          created_date: new Date().toISOString(),
        })
      } catch (e) {
        toast.error(`Failed: ${file.name}`)
      }
    }
    if (newPhotos.length) {
      savePhotos([...newPhotos, ...photos])
      toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} uploaded`)
    }
    setUploading(false)
  }, [photos, savePhotos, activeFolder])

  // Drag & drop
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true) }
  function handleDragLeave() { setDragOver(false) }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  // Actions
  function deletePhotos(ids: string[]) {
    savePhotos(photos.filter(p => !ids.includes(p.id)))
    setSelected(new Set())
    toast.success(`${ids.length} photo${ids.length > 1 ? 's' : ''} deleted`)
  }

  function renamePhoto(id: string, name: string) {
    savePhotos(photos.map(p => p.id === id ? { ...p, name } : p))
    setRenaming(null)
    toast.success('Renamed')
  }

  function addTag(id: string, tag: string) {
    if (!tag.trim()) return
    savePhotos(photos.map(p => p.id === id ? { ...p, tags: Array.from(new Set([...p.tags, tag.trim().toLowerCase()])) } : p))
    setTagVal('')
  }

  function removeTag(id: string, tag: string) {
    savePhotos(photos.map(p => p.id === id ? { ...p, tags: p.tags.filter(t => t !== tag) } : p))
  }

  function createFolder() {
    if (!folderName.trim()) return
    saveFolders([...folders, { id: uid(), name: folderName.trim() }])
    setFolderName('')
    setNewFolder(false)
    toast.success('Folder created')
  }

  function deleteFolder(id: string) {
    saveFolders(folders.filter(f => f.id !== id))
    // Unassign photos from deleted folder
    savePhotos(photos.map(p => p.folder_id === id ? { ...p, folder_id: null } : p))
    if (activeFolder === id) setActiveFolder(null)
    toast.success('Folder deleted')
  }

  function moveToFolder(photoIds: string[], folderId: string | null) {
    savePhotos(photos.map(p => photoIds.includes(p.id) ? { ...p, folder_id: folderId } : p))
    setSelected(new Set())
    toast.success('Moved')
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleEditorSave(url: string, photoId: string) {
    // Save edited image as a new photo
    const original = photos.find(p => p.id === photoId)
    const newPhoto: Photo = {
      id: uid(),
      url,
      name: (original?.name || 'Edited') + ' (edited)',
      tags: [...(original?.tags || []), 'edited'],
      folder_id: original?.folder_id || null,
      created_date: new Date().toISOString(),
    }
    savePhotos([newPhoto, ...photos])
    setEditingPhoto(null)
    toast.success('Edited photo saved to library')
  }

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Folder sidebar */}
      <div
        className="w-52 flex-shrink-0 border-r p-3 space-y-1 overflow-y-auto"
        style={{ borderColor: 'rgba(245,158,11,0.1)', background: '#111015' }}
      >
        <button
          onClick={() => setActiveFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            !activeFolder ? 'text-[#fcd34d]' : 'text-[#9ca3af] hover:text-[#e5e7eb]'
          }`}
          style={!activeFolder ? { background: 'rgba(245,158,11,0.12)' } : {}}
        >
          <PhotoIcon className="w-4 h-4" /> All Photos
          <span className="ml-auto text-xs opacity-60">{photos.length}</span>
        </button>

        {folders.map(f => (
          <div key={f.id} className="group flex items-center">
            <button
              onClick={() => setActiveFolder(f.id)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeFolder === f.id ? 'text-[#fcd34d]' : 'text-[#9ca3af] hover:text-[#e5e7eb]'
              }`}
              style={activeFolder === f.id ? { background: 'rgba(245,158,11,0.12)' } : {}}
            >
              <FolderIcon className="w-4 h-4" />
              <span className="truncate">{f.name}</span>
              <span className="ml-auto text-xs opacity-60">
                {photos.filter(p => p.folder_id === f.id).length}
              </span>
            </button>
            <button
              onClick={() => deleteFolder(f.id)}
              className="hidden group-hover:block p-1 text-red-400/60 hover:text-red-400"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        ))}

        {newFolder ? (
          <div className="flex gap-1 mt-2">
            <input
              className="inp flex-1 text-xs"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && createFolder()}
            />
            <button className="text-xs text-[#f59e0b]" onClick={createFolder}><CheckIcon className="w-4 h-4" /></button>
            <button className="text-xs text-[#6b7280]" onClick={() => setNewFolder(false)}><XMarkIcon className="w-4 h-4" /></button>
          </div>
        ) : (
          <button
            onClick={() => setNewFolder(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#fcd34d] transition-colors"
          >
            <FolderPlusIcon className="w-4 h-4" /> New Folder
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              className="inp pl-9 w-full"
              placeholder="Search photos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-p flex items-center gap-2"
            style={{ background: '#f59e0b' }}
          >
            {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />

          {selected.size > 0 && (
            <>
              <span className="text-xs text-[#fcd34d]">{selected.size} selected</span>
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
                onClick={() => deletePhotos([...selected])}
                className="btn btn-d btn-sm flex items-center gap-1"
              >
                <TrashIcon className="w-3 h-3" /> Delete
              </button>
            </>
          )}
        </div>

        {/* Photo grid */}
        <div
          ref={dropRef}
          className={`flex-1 overflow-y-auto p-4 ${dragOver ? 'ring-2 ring-[#f59e0b] ring-inset' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6b7280]">
              <PhotoIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">
                {search ? 'No photos match your search' : 'No photos yet'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term' : 'Upload images or drag & drop them here'}
              </p>
              {!search && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn mt-4 flex items-center gap-2 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/10"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" /> Upload Photos
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {filtered.map(photo => {
                const isSelected = selected.has(photo.id)
                return (
                  <div
                    key={photo.id}
                    className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]'
                        : 'border-[rgba(245,158,11,0.1)] hover:border-[rgba(245,158,11,0.3)]'
                    }`}
                    style={{ background: '#1a1920' }}
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden" onClick={() => setLightbox(photo)}>
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Select checkbox */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleSelect(photo.id) }}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#f59e0b] text-white'
                          : 'bg-black/40 text-white/60 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>

                    {/* Quick actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); setEditingPhoto(photo) }}
                        className="w-7 h-7 rounded-md bg-black/50 backdrop-blur text-white/80 hover:text-white flex items-center justify-center"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setLightbox(photo) }}
                        className="w-7 h-7 rounded-md bg-black/50 backdrop-blur text-white/80 hover:text-white flex items-center justify-center"
                        title="Preview"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-2.5">
                      {renaming === photo.id ? (
                        <div className="flex gap-1">
                          <input
                            className="inp flex-1 text-xs py-1"
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && renamePhoto(photo.id, renameVal)}
                          />
                          <button onClick={() => renamePhoto(photo.id, renameVal)} className="text-[#f59e0b]">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p
                          className="text-xs text-[#e5e7eb] truncate cursor-pointer hover:text-[#fcd34d]"
                          onClick={e => { e.stopPropagation(); setRenaming(photo.id); setRenameVal(photo.name) }}
                          title="Click to rename"
                        >
                          {photo.name}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {photo.tags.map(t => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] text-[#fcd34d] cursor-pointer hover:bg-[rgba(245,158,11,0.2)] group/tag flex items-center gap-0.5"
                            onClick={e => { e.stopPropagation(); removeTag(photo.id, t) }}
                          >
                            {t}
                            <XMarkIcon className="w-2.5 h-2.5 opacity-0 group-hover/tag:opacity-100" />
                          </span>
                        ))}
                        {tagging === photo.id ? (
                          <input
                            className="text-[10px] bg-transparent border border-[rgba(245,158,11,0.3)] rounded-full px-1.5 py-0.5 text-[#fcd34d] w-16 outline-none"
                            value={tagVal}
                            onChange={e => setTagVal(e.target.value)}
                            autoFocus
                            placeholder="tag"
                            onKeyDown={e => {
                              if (e.key === 'Enter') { addTag(photo.id, tagVal); setTagging(null) }
                              if (e.key === 'Escape') setTagging(null)
                            }}
                            onBlur={() => { if (tagVal.trim()) addTag(photo.id, tagVal); setTagging(null) }}
                          />
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setTagging(photo.id); setTagVal('') }}
                            className="text-[10px] px-1 py-0.5 rounded-full text-[#6b7280] hover:text-[#fcd34d] transition-colors"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}

      {/* Photo Editor */}
      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto}
          onSave={(url) => handleEditorSave(url, editingPhoto.id)}
          onClose={() => setEditingPhoto(null)}
        />
      )}
    </div>
  )
}
