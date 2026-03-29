'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { WorkspaceBrand, BlogPost } from '@/lib/types'

interface BlogContextValue {
  brands: WorkspaceBrand[]
  activeBrand: WorkspaceBrand | null
  setActiveBrandById: (id: string) => void
  drafts: BlogPost[]
  loading: boolean
  reload: () => Promise<void>
  createBrand: (data: Partial<WorkspaceBrand>) => Promise<WorkspaceBrand>
  updateBrand: (id: string, data: Partial<WorkspaceBrand>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  saveDraft: (data: Partial<BlogPost>) => Promise<BlogPost>
  deleteDraft: (id: string) => Promise<void>
  markPublished: (id: string) => Promise<void>
}

const BlogContext = createContext<BlogContextValue | null>(null)

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog must be used inside BlogProvider')
  return ctx
}

export function BlogProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<WorkspaceBrand[]>([])
  const [activeBrand, setActiveBrand] = useState<WorkspaceBrand | null>(null)
  const [drafts, setDrafts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const brandsRes = await fetch('/api/brands')
      if (brandsRes.ok) {
        const b: WorkspaceBrand[] = await brandsRes.json()
        setBrands(b)
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('blog_active_brand') : null
        const found = b.find(br => br.id === savedId) ?? b[0] ?? null
        setActiveBrand(found)
        if (found) {
          const postsRes = await fetch(`/api/blog/posts?brandId=${found.id}`)
          if (postsRes.ok) setDrafts(await postsRes.json())
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function setActiveBrandById(id: string) {
    const brand = brands.find(b => b.id === id) ?? null
    setActiveBrand(brand)
    if (typeof window !== 'undefined') localStorage.setItem('blog_active_brand', id)
    if (brand) {
      const res = await fetch(`/api/blog/posts?brandId=${brand.id}`)
      if (res.ok) setDrafts(await res.json())
    } else {
      setDrafts([])
    }
  }

  async function createBrand(data: Partial<WorkspaceBrand>): Promise<WorkspaceBrand> {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    const brand: WorkspaceBrand = await res.json()
    setBrands(prev => [...prev, brand])
    if (!activeBrand) {
      setActiveBrand(brand)
      if (typeof window !== 'undefined') localStorage.setItem('blog_active_brand', brand.id)
    }
    return brand
  }

  async function updateBrand(id: string, data: Partial<WorkspaceBrand>) {
    const res = await fetch('/api/brands', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated: WorkspaceBrand = await res.json()
    setBrands(prev => prev.map(b => b.id === id ? updated : b))
    if (activeBrand?.id === id) setActiveBrand(updated)
  }

  async function deleteBrand(id: string) {
    const res = await fetch(`/api/brands?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    const remaining = brands.filter(b => b.id !== id)
    setBrands(remaining)
    if (activeBrand?.id === id) {
      const next = remaining[0] ?? null
      setActiveBrand(next)
      if (next && typeof window !== 'undefined') localStorage.setItem('blog_active_brand', next.id)
    }
  }

  async function saveDraft(data: Partial<BlogPost>): Promise<BlogPost> {
    if (!activeBrand) throw new Error('No active brand')
    const res = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, brandId: activeBrand.id }),
    })
    if (!res.ok) throw new Error(await res.text())
    const post: BlogPost = await res.json()
    setDrafts(prev => {
      const idx = prev.findIndex(p => p.id === post.id)
      return idx >= 0 ? prev.map(p => p.id === post.id ? post : p) : [post, ...prev]
    })
    return post
  }

  async function deleteDraft(id: string) {
    const res = await fetch(`/api/blog/posts?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    setDrafts(prev => prev.filter(p => p.id !== id))
  }

  async function markPublished(id: string) {
    const res = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'published', publishedDate: new Date().toLocaleDateString('en-AU') }),
    })
    if (!res.ok) throw new Error(await res.text())
    const post: BlogPost = await res.json()
    setDrafts(prev => prev.map(p => p.id === id ? post : p))
  }

  return (
    <BlogContext.Provider value={{
      brands, activeBrand, setActiveBrandById,
      drafts, loading, reload,
      createBrand, updateBrand, deleteBrand,
      saveDraft, deleteDraft, markPublished,
    }}>
      {children}
    </BlogContext.Provider>
  )
}
