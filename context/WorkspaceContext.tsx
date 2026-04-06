'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Brand, Client, Folder, Photo, Post, Settings, WorkspaceBrand } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'
import { uid as genUid } from '@/lib/utils'

// Re-export uid for convenience
export { genUid as uid }

interface WorkspaceState {
  brands: Brand[]
  posts: Post[]
  photos: Photo[]
  clients: Client[]
  folders: Folder[]
  settings: Settings
  profile: { name: string; email: string; role?: string }
  loading: boolean
  workspaceId: string | null
  currentUserId: string | null
  role: 'admin' | 'team' | 'client'
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Partial<WorkspaceState> }
  | { type: 'SET_BRANDS'; payload: Brand[] }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_PROFILE'; payload: { name: string; email: string } }


const initialState: WorkspaceState = {
  brands: [],
  posts: [],
  photos: [],
  clients: [],
  folders: [],
  settings: { ...DEFAULT_SETTINGS },
  profile: { name: '', email: '' },
  loading: true,
  workspaceId: null,
  currentUserId: null,
  role: 'admin',
}

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'LOAD_START': return { ...state, loading: true }
    case 'LOAD_SUCCESS': return { ...state, ...action.payload, loading: false }
    case 'SET_BRANDS': return { ...state, brands: action.payload }
    case 'SET_POSTS': return { ...state, posts: action.payload }
    case 'SET_PHOTOS': return { ...state, photos: action.payload }
    case 'SET_CLIENTS': return { ...state, clients: action.payload }
    case 'SET_FOLDERS': return { ...state, folders: action.payload }
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_PROFILE': return { ...state, profile: action.payload }
    default: return state
  }
}

interface WorkspaceContextValue extends WorkspaceState {
  saveBrands: (v: Brand[]) => void
  savePosts: (v: Post[]) => void
  savePhotos: (v: Photo[]) => void
  saveClients: (v: Client[]) => void
  saveFolders: (v: Folder[]) => void
  saveSettings: (v: Partial<Settings>) => void
  saveProfile: (v: { name: string; email: string }) => void
  reload: () => Promise<void>
  isAdmin: () => boolean
  isTeam: () => boolean
  isClient: () => boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  children,
  userId,
  role,
  workspaceId,
}: {
  children: ReactNode
  userId: string
  role: 'admin' | 'team' | 'client'
  workspaceId: string
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    role,
    workspaceId,
    currentUserId: userId,
  })

  const sb = createClient()

  function wbToBrand(wb: WorkspaceBrand): Brand {
    return {
      id: wb.id,
      name: wb.name,
      color: wb.primaryColor,
      website: wb.website,
      tone: wb.tone,
      output_length: wb.outputLength,
      brand_guidelines: wb.brandVoice,
      posting_instructions: wb.postingInstructions,
      default_aspect_ratio: wb.defaultAspectRatio,
      include_hashtags: wb.includeHashtags,
      include_emojis: wb.includeEmojis,
      social_handles: wb.socialHandles,
      platforms: wb.platforms,
      buffer_channels: wb.bufferChannels,
      posting_days: wb.postingDays,
      posting_time: wb.postingTime,
      buffer_profile_ids: wb.bufferProfileIds,
      key_messages: wb.keyMessages,
      replicateModelVersion: wb.replicateModelVersion,
      trainingStatus: wb.trainingStatus,
      trainingId: wb.trainingId,
      triggerWord: wb.triggerWord,
      created_date: wb.createdAt,
    }
  }

  const cacheKey = `workspace_cache_${workspaceId}`

  const load = useCallback(async () => {
    // Show cached data instantly if available — no loading spinner on repeat visits
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        dispatch({ type: 'LOAD_SUCCESS', payload: { ...parsed, loading: false } })
      } else {
        dispatch({ type: 'LOAD_START' })
      }
    } catch {
      dispatch({ type: 'LOAD_START' })
    }

    // Always fetch fresh data in the background
    try {
      const [brandsRes, postsR, photosR, clientsR, settingsR, profileR, foldersR] = await Promise.all([
        fetch('/api/brands'),
        sb.from('posts').select('data').eq('workspace_id', workspaceId),
        sb.from('photos').select('data').eq('workspace_id', workspaceId),
        sb.from('clients').select('data').eq('workspace_id', workspaceId),
        sb.from('settings').select('data').eq('workspace_id', workspaceId).single(),
        sb.from('profiles').select('*').eq('id', userId).single(),
        sb.from('folders').select('data').eq('workspace_id', workspaceId),
      ])

      const wbBrands: WorkspaceBrand[] = brandsRes.ok ? await brandsRes.json() : []
      const brands: Brand[] = wbBrands.map(wbToBrand)
      const posts: Post[] = (postsR.data || [])
        .map((r: { data: Post }) => r.data)
        .filter((p: Post) => !String((p as unknown as Record<string, unknown>).type || '').includes('blog'))
      const photos: Photo[] = (photosR.data || []).map((r: { data: Photo }) => r.data)
      const clients: Client[] = (clientsR.data || []).map((r: { data: Client }) => r.data)
      const settings: Settings = settingsR.data?.data
        ? { ...DEFAULT_SETTINGS, ...settingsR.data.data }
        : { ...DEFAULT_SETTINGS }
      const profileData = profileR.data
      const profile = {
        name: profileData?.display_name || '',
        email: profileData?.email || '',
        role: profileData?.role,
      }
      const folders: Folder[] = (foldersR.data || []).map((r: { data: Folder }) => r.data)

      const fresh = { brands, posts, photos, clients, settings, profile, folders }
      dispatch({ type: 'LOAD_SUCCESS', payload: { ...fresh, loading: false, workspaceId, role } })

      // Update cache for next mount
      try { localStorage.setItem(cacheKey, JSON.stringify(fresh)) } catch { /* quota */ }
    } catch (e) {
      console.error('WorkspaceProvider load error:', e)
      toast.error('Failed to load workspace data')
      dispatch({ type: 'LOAD_SUCCESS', payload: { loading: false } })
    }
  }, [workspaceId, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  async function syncTable(table: string, rows: unknown[]) {
    if (!workspaceId) return
    try {
      localStorage.removeItem(cacheKey)
      await sb.from(table).delete().eq('workspace_id', workspaceId)
      if (rows.length) {
        const toInsert = rows.map((r: unknown) => {
          const row = r as Record<string, unknown>
          const base: Record<string, unknown> = { id: row.id, workspace_id: workspaceId, data: r }
          if (table === 'posts') {
            base.brand_profile_id = row.brand_profile_id || null
            base.client_visible = row.client_visible || false
          }
          return base
        })
        await sb.from(table).insert(toInsert)
      }
    } catch (e) {
      console.error(`Sync error [${table}]:`, e)
      toast.error(`Failed to save ${table}`)
    }
  }

  const saveBrands = useCallback((v: Brand[]) => {
    dispatch({ type: 'SET_BRANDS', payload: v })
    // Sync to unified workspace_brands via API
    // Diff: upsert changed brands, delete removed ones
    const prev = state.brands
    const prevIds = new Set(prev.map(b => b.id))
    const newIds = new Set(v.map(b => b.id))
    // Delete removed
    for (const id of prevIds) {
      if (!newIds.has(id)) {
        fetch(`/api/brands?id=${id}`, { method: 'DELETE' }).catch(() => toast.error('Failed to delete brand'))
      }
    }
    // Upsert changed/new
    for (const brand of v) {
      const isNew = !prevIds.has(brand.id)
      const payload = {
        id: brand.id,
        name: brand.name,
        primaryColor: brand.color,
        website: brand.website || '',
        tone: brand.tone,
        outputLength: brand.output_length,
        brandVoice: brand.brand_guidelines || '',
        postingInstructions: brand.posting_instructions || '',
        defaultAspectRatio: brand.default_aspect_ratio || '',
        includeHashtags: brand.include_hashtags,
        includeEmojis: brand.include_emojis,
        socialHandles: brand.social_handles || {},
        platforms: brand.platforms || [],
        bufferChannels: brand.buffer_channels || [],
        bufferProfileIds: brand.buffer_profile_ids || [],
        keyMessages: brand.key_messages || [],
        replicateModelVersion: brand.replicateModelVersion || '',
        trainingStatus: brand.trainingStatus || 'idle',
        trainingId: brand.trainingId || '',
        triggerWord: brand.triggerWord || '',
      }
      fetch('/api/brands', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => toast.error('Failed to save brand'))
    }
  }, [state.brands, workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const savePosts = useCallback((v: Post[]) => {
    dispatch({ type: 'SET_POSTS', payload: v })
    syncTable('posts', v)
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const savePhotos = useCallback((v: Photo[]) => {
    dispatch({ type: 'SET_PHOTOS', payload: v })
    syncTable('photos', v)
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveClients = useCallback((v: Client[]) => {
    dispatch({ type: 'SET_CLIENTS', payload: v })
    syncTable('clients', v)
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveFolders = useCallback((v: Folder[]) => {
    dispatch({ type: 'SET_FOLDERS', payload: v })
    syncTable('folders', v)
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSettings = useCallback((v: Partial<Settings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: v })
    const updated = { ...state.settings, ...v }
    sb.from('settings')
      .upsert({ workspace_id: workspaceId, data: updated })
      .then(({ error }) => { if (error) { console.error('Settings sync error:', error.message); toast.error('Failed to save settings') } })
  }, [state.settings, workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveProfile = useCallback((v: { name: string; email: string }) => {
    dispatch({ type: 'SET_PROFILE', payload: v })
    sb.from('profiles')
      .update({ display_name: v.name })
      .eq('id', userId)
      .then(({ error }) => { if (error) { console.error('Profile sync error:', error.message); toast.error('Failed to save profile') } })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = () => role === 'admin'
  const isTeam = () => role === 'team'
  const isClient = () => role === 'client'

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        saveBrands,
        savePosts,
        savePhotos,
        saveClients,
        saveFolders,
        saveSettings,
        saveProfile,
        reload: load,
        isAdmin,
        isTeam,
        isClient,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}

export function useWorkspaceOptional() {
  return useContext(WorkspaceContext)
}
