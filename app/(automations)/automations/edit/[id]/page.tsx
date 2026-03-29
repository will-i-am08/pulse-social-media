'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { ACTION_LABELS, SCHEDULE_PRESETS } from '@/lib/automations/types'
import type { ActionType, AutomationStep, TriggerType } from '@/lib/automations/types'
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/16/solid'

const ACTION_TYPES = Object.keys(ACTION_LABELS) as ActionType[]

interface Brand {
  id: string
  name: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function StepCard({
  step,
  index,
  total,
  brands,
  onUpdate,
  onRemove,
  onMove,
}: {
  step: AutomationStep
  index: number
  total: number
  brands: Brand[]
  onUpdate: (s: AutomationStep) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const updateConfig = (key: string, value: unknown) => {
    onUpdate({ ...step, config: { ...step.config, [key]: value } })
  }

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.12)] rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <select
          className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
          value={step.actionType}
          onChange={e => onUpdate({ ...step, actionType: e.target.value as ActionType, label: ACTION_LABELS[e.target.value as ActionType] })}
        >
          {ACTION_TYPES.map(t => <option key={t} value={t}>{ACTION_LABELS[t]}</option>)}
        </select>
        <div className="flex gap-1">
          {index > 0 && (
            <button onClick={() => onMove(-1)} className="p-1 text-slate-500 hover:text-slate-300"><ArrowUpIcon className="w-3.5 h-3.5" /></button>
          )}
          {index < total - 1 && (
            <button onClick={() => onMove(1)} className="p-1 text-slate-500 hover:text-slate-300"><ArrowDownIcon className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={onRemove} className="p-1 text-slate-500 hover:text-red-400"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Label */}
      <div className="mb-3">
        <label className="text-xs text-slate-500 block mb-1">Step Label</label>
        <input
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
          value={step.label}
          onChange={e => onUpdate({ ...step, label: e.target.value })}
        />
      </div>

      {/* Action-specific config */}
      <div className="space-y-3">
        {(step.actionType === 'generate-blog-ideas' || step.actionType === 'generate-blog-post' || step.actionType === 'keyword-research') && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Brand</label>
            <select
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
              value={(step.config.brandId as string) || ''}
              onChange={e => updateConfig('brandId', e.target.value)}
            >
              <option value="">Select a brand…</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        {step.actionType === 'generate-blog-ideas' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Number of Ideas</label>
            <input type="number" min={1} max={15}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
              value={(step.config.count as number) || 5}
              onChange={e => updateConfig('count', parseInt(e.target.value) || 5)}
            />
          </div>
        )}

        {step.actionType === 'generate-blog-post' && (
          <>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Title</label>
              <input
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
                placeholder="Blog post title…"
                value={(step.config.title as string) || ''}
                onChange={e => updateConfig('title', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Tags (comma-separated)</label>
              <input
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
                placeholder="seo, marketing, tips"
                value={(step.config.tags as string) || ''}
                onChange={e => updateConfig('tags', e.target.value)}
              />
            </div>
          </>
        )}

        {(step.actionType === 'seo-audit-onpage' || step.actionType === 'seo-audit-technical' || step.actionType === 'ai-visibility-audit') && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">URL</label>
            <input
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
              placeholder="https://example.com"
              value={(step.config.url as string) || ''}
              onChange={e => updateConfig('url', e.target.value)}
            />
          </div>
        )}

        {step.actionType === 'keyword-research' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Seed Keyword</label>
            <input
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
              placeholder="e.g. plumber melbourne"
              value={(step.config.seedKeyword as string) || ''}
              onChange={e => updateConfig('seedKeyword', e.target.value)}
            />
          </div>
        )}

        {step.actionType === 'generate-image' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Prompt</label>
            <textarea
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none"
              rows={2}
              placeholder="Describe the image to generate…"
              value={(step.config.prompt as string) || ''}
              onChange={e => updateConfig('prompt', e.target.value)}
            />
          </div>
        )}

        {step.actionType === 'generate-social-caption' && (
          <>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Brand</label>
              <select
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
                value={(step.config.brandId as string) || ''}
                onChange={e => updateConfig('brandId', e.target.value)}
              >
                <option value="">Select a brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Platforms</label>
              <div className="flex gap-2">
                {['instagram', 'facebook', 'linkedin', 'tiktok'].map(p => {
                  const selected = ((step.config.platforms as string[]) || ['instagram']).includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        const current = (step.config.platforms as string[]) || ['instagram']
                        updateConfig('platforms', selected ? current.filter(x => x !== p) : [...current, p])
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selected ? 'bg-sky-500/20 text-sky-400' : 'bg-[rgba(255,255,255,0.04)] text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Topic / Instructions</label>
              <textarea
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none"
                rows={2}
                placeholder="What should the caption be about?"
                value={(step.config.prompt as string) || ''}
                onChange={e => updateConfig('prompt', e.target.value)}
              />
            </div>
          </>
        )}

        {step.actionType === 'create-social-post' && (
          <>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Brand</label>
              <select
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
                value={(step.config.brandId as string) || ''}
                onChange={e => updateConfig('brandId', e.target.value)}
              >
                <option value="">Select a brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Caption</label>
              <textarea
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none"
                rows={3}
                placeholder="Post caption (or leave blank to use output from a previous Generate Social Caption step)"
                value={(step.config.caption as string) || ''}
                onChange={e => updateConfig('caption', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Platforms</label>
              <div className="flex gap-2">
                {['instagram', 'facebook', 'linkedin', 'tiktok'].map(p => {
                  const selected = ((step.config.platforms as string[]) || ['instagram']).includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        const current = (step.config.platforms as string[]) || ['instagram']
                        updateConfig('platforms', selected ? current.filter(x => x !== p) : [...current, p])
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selected ? 'bg-sky-500/20 text-sky-400' : 'bg-[rgba(255,255,255,0.04)] text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Status</label>
              <select
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
                value={(step.config.status as string) || 'draft'}
                onChange={e => updateConfig('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </>
        )}

        {step.actionType === 'send-notification' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Message</label>
            <input
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
              placeholder="Notification message…"
              value={(step.config.message as string) || ''}
              onChange={e => updateConfig('message', e.target.value)}
            />
          </div>
        )}

        {step.actionType === 'ai-prompt' && (
          <>
            <div>
              <label className="text-xs text-slate-500 block mb-1">System Prompt (optional)</label>
              <textarea
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none"
                rows={2}
                placeholder="You are a helpful assistant…"
                value={(step.config.systemPrompt as string) || ''}
                onChange={e => updateConfig('systemPrompt', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Prompt</label>
              <textarea
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none"
                rows={3}
                placeholder="What should Claude do?"
                value={(step.config.userContent as string) || ''}
                onChange={e => updateConfig('userContent', e.target.value)}
              />
            </div>
          </>
        )}

        {step.actionType === 'publish-blog-post' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Post ID</label>
            <input
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none"
              placeholder="blog-xxxxxxxx-xxxx-xxxx…"
              value={(step.config.postId as string) || ''}
              onChange={e => updateConfig('postId', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditAutomationPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('manual')
  const [cron, setCron] = useState('')
  const [eventType, setEventType] = useState('')
  const [steps, setSteps] = useState<AutomationStep[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    async function loadBrands() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data } = await sb.from('workspace_brands').select('id, name').eq('user_id', user.id)
      if (data) setBrands(data)
    }
    loadBrands()
  }, [])

  useEffect(() => {
    if (isNew) return
    async function loadAutomation() {
      const res = await fetch(`/api/automations/${params.id}`)
      if (!res.ok) { toast.error('Automation not found'); router.push('/automations/list'); return }
      const data = await res.json()
      setName(data.name || '')
      setDescription(data.description || '')
      setTriggerType(data.trigger_type || 'manual')
      setCron(data.trigger_config?.cron || '')
      setEventType(data.trigger_config?.event || '')
      setSteps(data.steps || [])
      setLoading(false)
    }
    loadAutomation()
  }, [isNew, params.id, router])

  function addStep() {
    setSteps([...steps, {
      id: uid(),
      actionType: 'ai-prompt',
      label: ACTION_LABELS['ai-prompt'],
      config: {},
    }])
  }

  function updateStep(index: number, step: AutomationStep) {
    setSteps(steps.map((s, i) => i === index ? step : s))
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index))
  }

  function moveStep(index: number, dir: -1 | 1) {
    const newSteps = [...steps]
    const target = index + dir
    if (target < 0 || target >= newSteps.length) return
    ;[newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]]
    setSteps(newSteps)
  }

  async function save() {
    if (!name.trim()) { toast.error('Name is required'); return }
    if (steps.length === 0) { toast.error('Add at least one step'); return }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name,
        description,
        steps,
        triggerType,
        triggerConfig: triggerType === 'schedule' ? { cron } : triggerType === 'event' ? { event: eventType } : {},
        isEnabled: true,
      }
      if (!isNew) body.id = params.id

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(isNew ? 'Automation created!' : 'Automation saved!')
      router.push('/automations/list')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-1">
        {isNew ? 'Create Automation' : 'Edit Automation'}
      </h1>
      <p className="text-slate-400 mb-8">Build a multi-step workflow</p>

      {/* Name & Description */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Name</label>
          <input
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white px-4 py-2.5 outline-none"
            placeholder="My Automation"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Description (optional)</label>
          <input
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white px-4 py-2.5 outline-none"
            placeholder="What does this automation do?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Trigger */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Trigger</h2>
        <div className="flex gap-2 mb-4">
          {(['manual', 'schedule', 'event'] as TriggerType[]).map(t => (
            <button
              key={t}
              onClick={() => setTriggerType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                triggerType === t
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-[rgba(255,255,255,0.04)] text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {triggerType === 'schedule' && (
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl p-4">
            <label className="text-xs text-slate-500 block mb-2">Schedule</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SCHEDULE_PRESETS.map(p => (
                <button
                  key={p.cron}
                  onClick={() => setCron(p.cron)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    cron === p.cron
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-[rgba(255,255,255,0.04)] text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Custom cron expression</label>
              <input
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none font-mono"
                placeholder="0 9 * * *"
                value={cron}
                onChange={e => setCron(e.target.value)}
              />
            </div>
          </div>
        )}

        {triggerType === 'event' && (
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl p-4">
            <label className="text-xs text-slate-500 block mb-1">Event Type</label>
            <select
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
              value={eventType}
              onChange={e => setEventType(e.target.value)}
            >
              <option value="">Select an event…</option>
              <option value="post_published">Post Published</option>
              <option value="client_added">New Client Added</option>
              <option value="brand_created">New Brand Created</option>
            </select>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Steps</h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              total={steps.length}
              brands={brands}
              onUpdate={s => updateStep(i, s)}
              onRemove={() => removeStep(i)}
              onMove={dir => moveStep(i, dir)}
            />
          ))}
        </div>
        <button
          onClick={addStep}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[rgba(14,165,233,0.2)] text-slate-500 hover:text-sky-400 hover:border-sky-500/30 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Add Step
        </button>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)', opacity: saving ? 0.7 : 1 }}
      >
        {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
        {saving ? 'Saving…' : isNew ? 'Create Automation' : 'Save Changes'}
      </button>
    </div>
  )
}
