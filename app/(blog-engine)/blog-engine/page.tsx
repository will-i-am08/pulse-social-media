'use client'

import { useState, useEffect } from 'react'
import { useTab } from '../BlogShell'
import { useBlog } from '@/context/BlogContext'
import { BlogBrand, BlogPost } from '@/lib/types'

// Components
import { BrandSwitcher, BrandManagerModal } from './components/BrandManager'
import IdeasTab, { IdeaItem } from './components/IdeaGenerator'
import WriterTab, { PhotoItem } from './components/BlogWriter'
import PostsTab from './components/BlogPosts'
import ImagesTab from './components/ImagesTab'

export default function BlogEnginePage() {
  const { activeTab, setActiveTab } = useTab()
  const { activeBrand, loading, createBrand, updateBrand, deleteBrand } = useBlog()
  const [brandManagerOpen, setBrandManagerOpen] = useState(false)
  const [brandToEdit, setBrandToEdit] = useState<BlogBrand | null>(null)
  const [writerInit, setWriterInit] = useState<{ title: string; tags: string; draftId?: string } | null>(null)
  const [photos, setPhotos] = useState<PhotoItem[]>([])

  // Fetch workspace photos for the library picker
  useEffect(() => {
    fetch('/api/photos')
      .then(res => res.ok ? res.json() : [])
      .then((data: PhotoItem[]) => setPhotos(data))
      .catch(() => setPhotos([]))
  }, [])

  const pc = activeBrand?.primaryColor || '#0d9488'

  function openBrandManager(brand: BlogBrand | null) {
    setBrandToEdit(brand)
    setBrandManagerOpen(true)
  }

  function handleSelectIdea(idea: IdeaItem) {
    setWriterInit({ title: idea.title, tags: idea.keywords?.join(', ') || '' })
    setActiveTab('writer')
  }

  function handleEditPost(post: BlogPost) {
    setWriterInit({ title: post.title, tags: post.tags, draftId: post.id })
    setActiveTab('writer')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: '#0d9488' }} />
          <p className="text-sm text-slate-500">Loading Blog Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ '--blog-pc': pc } as React.CSSProperties}>
      {/* Top toolbar */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-3 flex-wrap">
        <BrandSwitcher onManage={openBrandManager} />

        {/* Tab nav */}
        <div className="flex items-center gap-1 ml-auto">
          {[
            { id: 'ideas', label: '\u25C7 Ideas' },
            { id: 'writer', label: '\u270E Writer' },
            { id: 'images', label: '\u25FB Images' },
            { id: 'posts', label: '\u2630 Posts' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={activeTab === t.id ? { background: `${pc}20`, color: pc } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'ideas' && <IdeasTab onSelectIdea={handleSelectIdea} />}
      {activeTab === 'writer' && (
        <WriterTab
          key={writerInit ? `${writerInit.title}-${writerInit.tags}-${writerInit.draftId || ''}` : 'blank'}
          initialTitle={writerInit?.title || ''}
          initialTags={writerInit?.tags || ''}
          initialDraftId={writerInit?.draftId || null}
          photos={photos}
        />
      )}
      {activeTab === 'images' && <ImagesTab />}
      {activeTab === 'posts' && <PostsTab onEdit={handleEditPost} />}

      {/* Brand manager modal */}
      {brandManagerOpen && (
        <BrandManagerModal
          brand={brandToEdit}
          onClose={() => setBrandManagerOpen(false)}
          onCreate={async (data) => { await createBrand(data) }}
          onUpdate={async (id, data) => { await updateBrand(id, data) }}
          onDelete={async (id) => { await deleteBrand(id) }}
        />
      )}
    </div>
  )
}
