'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useWorkspace } from './WorkspaceContext'
import type { Brand } from '@/lib/types'

type ActiveBrandId = string | null  // null === "All brands"

interface BrandContextValue {
  activeBrandId: ActiveBrandId
  activeBrand: Brand | null
  setActiveBrandId: (id: ActiveBrandId) => void
  brands: Brand[]
}

const BrandContext = createContext<BrandContextValue | null>(null)

const STORAGE_KEY = 'pulse.active_brand'

/**
 * Wraps the app to provide the currently-active brand. Reads from localStorage
 * on mount so the selection persists across reloads. Null means "All brands".
 */
export function BrandProvider({ children }: { children: ReactNode }) {
  const { brands } = useWorkspace()
  const [activeBrandId, setActiveBrandIdState] = useState<ActiveBrandId>(null)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        if (stored === '__all__') setActiveBrandIdState(null)
        else setActiveBrandIdState(stored)
      }
    } catch { /* ignore */ }
  }, [])

  // If the stored brand was deleted or never existed in this workspace, fall back to null
  useEffect(() => {
    if (activeBrandId && brands.length && !brands.find(b => b.id === activeBrandId)) {
      setActiveBrandIdState(null)
    }
  }, [activeBrandId, brands])

  const setActiveBrandId = useCallback((id: ActiveBrandId) => {
    setActiveBrandIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id === null ? '__all__' : id)
    } catch { /* ignore */ }
  }, [])

  const activeBrand = useMemo(
    () => (activeBrandId ? brands.find(b => b.id === activeBrandId) || null : null),
    [activeBrandId, brands]
  )

  const value = useMemo<BrandContextValue>(() => ({
    activeBrandId,
    activeBrand,
    setActiveBrandId,
    brands,
  }), [activeBrandId, activeBrand, setActiveBrandId, brands])

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useActiveBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useActiveBrand must be used inside BrandProvider')
  return ctx
}

/**
 * Filter a list of items (posts or anything with `brand_profile_id`) to the active brand.
 * Passes all items through when "All brands" is active.
 */
export function filterByActiveBrand<T extends { brand_profile_id?: string | null }>(
  items: T[],
  activeBrandId: ActiveBrandId
): T[] {
  if (!activeBrandId) return items
  return items.filter(i => i.brand_profile_id === activeBrandId)
}
