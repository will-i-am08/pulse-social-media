'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

export default function ImagesTab() {
  const [uploaded, setUploaded] = useState<Array<{ url: string; label: string }>>([])
  const [dragover, setDragover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const url = e.target?.result as string
        setUploaded(prev => [...prev, { url, label: file.name.replace(/\.[^/.]+$/, '') }])
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Image Library</h2>
        <p className="text-sm text-slate-500">Upload images to use as featured images in your posts.</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-6 cursor-pointer transition-all ${dragover ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 hover:border-white/25'}`}
        onDragOver={e => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={e => { e.preventDefault(); setDragover(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-4xl mb-3">&#128444;</div>
        <p className="text-sm text-slate-400">Drop images here or click to upload</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      {uploaded.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploaded.map((img, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(img.url).then(() => toast.success('URL copied!'))}
                  className="text-xs px-2 py-1 bg-white/20 rounded-lg text-white backdrop-blur-sm"
                >
                  Copy URL
                </button>
                <button onClick={() => setUploaded(prev => prev.filter((_, j) => j !== i))} className="text-xs text-red-400">Remove</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 text-xs text-white truncate">{img.label}</div>
            </div>
          ))}
        </div>
      )}

      {uploaded.length === 0 && (
        <div className="text-center py-8 text-slate-600 text-sm">No images uploaded yet</div>
      )}
    </div>
  )
}
