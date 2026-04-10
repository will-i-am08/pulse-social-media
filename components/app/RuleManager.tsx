'use client'

import { useState } from 'react'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import type { BrandRule } from '@/lib/types'
import {
  type EnhancedBrandRule,
  type RuleCategory,
  type RulePriority,
  type RuleFrequency,
  RULE_CATEGORIES,
  RULE_PRIORITIES,
  RULE_FREQUENCIES,
  createBlankRule,
  upgradeRule,
} from '@/lib/caption-engine'

const PLATFORM_OPTIONS = ['instagram', 'facebook', 'linkedin', 'tiktok']

const PRIORITY_COLOURS: Record<RulePriority, string> = {
  must: 'text-red-400 bg-red-500/10 border-red-500/30',
  should: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'nice-to-have': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}

const FREQUENCY_LABELS: Record<RuleFrequency, string> = {
  always: '100%',
  often: '~80%',
  sometimes: '~40%',
  rarely: '~15%',
}

interface Props {
  rules: BrandRule[]
  onChange: (rules: EnhancedBrandRule[]) => void
}

export default function RuleManager({ rules, onChange }: Props) {
  const enhanced: EnhancedBrandRule[] = rules.map(upgradeRule)
  const [filterCategory, setFilterCategory] = useState<RuleCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterCategory === 'all'
    ? enhanced
    : enhanced.filter(r => r.category === filterCategory)

  // Sort: enabled first, then by priority (must > should > nice-to-have)
  const priorityOrder: Record<RulePriority, number> = { must: 0, should: 1, 'nice-to-have': 2 }
  const sorted = [...filtered].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
    return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
  })

  function updateRule(id: string, patch: Partial<EnhancedBrandRule>) {
    onChange(enhanced.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function removeRule(id: string) {
    onChange(enhanced.filter(r => r.id !== id))
  }

  function addRule() {
    const newRule = createBlankRule({
      category: filterCategory === 'all' ? 'general' : filterCategory,
    })
    onChange([...enhanced, newRule])
    setExpandedId(newRule.id)
  }

  function duplicateRule(rule: EnhancedBrandRule) {
    const dup = createBlankRule({ ...rule, label: rule.label + ' (copy)' })
    onChange([...enhanced, dup])
    setExpandedId(dup.id)
  }

  const enabledCount = enhanced.filter(r => r.enabled).length
  const categoryCounts = new Map<string, number>()
  for (const r of enhanced) {
    if (r.enabled) categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e6e1e1]">Caption Rules</h3>
          <p className="text-xs text-[#e1bec0]">{enabledCount} active rule{enabledCount !== 1 ? 's' : ''} across {categoryCounts.size} categor{categoryCounts.size !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={addRule} className="btn text-sm flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${filterCategory === 'all' ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
        >
          All ({enhanced.length})
        </button>
        {RULE_CATEGORIES.map(cat => {
          const count = enhanced.filter(r => r.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${filterCategory === cat.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}
            >
              {cat.label} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-[#5a4042]">
            <p className="text-sm">No rules {filterCategory !== 'all' ? 'in this category' : 'yet'}</p>
            <button onClick={addRule} className="text-[#ff5473] text-sm mt-2 hover:underline">Add your first rule</button>
          </div>
        )}

        {sorted.map(rule => {
          const isExpanded = expandedId === rule.id
          return (
            <div
              key={rule.id}
              className={`rounded-xl border transition-all ${rule.enabled ? 'border-[rgba(90,64,66,0.4)] bg-[rgba(30,15,18,0.5)]' : 'border-[rgba(90,64,66,0.2)] bg-[rgba(30,15,18,0.2)] opacity-50'}`}
            >
              {/* Collapsed row */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rule.id)}>
                {/* Enable toggle */}
                <button
                  onClick={e => { e.stopPropagation(); updateRule(rule.id, { enabled: !rule.enabled }) }}
                  className={`w-8 h-5 rounded-full relative transition-colors flex-shrink-0 ${rule.enabled ? 'bg-[#ff5473]' : 'bg-[rgba(90,64,66,0.4)]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule.enabled ? 'left-3.5' : 'left-0.5'}`} />
                </button>

                {/* Label + prompt preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {rule.label && <span className="text-sm font-medium text-[#e6e1e1] truncate">{rule.label}</span>}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLOURS[rule.priority]}`}>
                      {RULE_PRIORITIES.find(p => p.id === rule.priority)?.label}
                    </span>
                    {rule.frequency !== 'always' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                        {FREQUENCY_LABELS[rule.frequency]}
                      </span>
                    )}
                    {rule.platforms.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                        {rule.platforms.join(', ')}
                      </span>
                    )}
                  </div>
                  {!rule.label && rule.prompt && (
                    <p className="text-sm text-[#e1bec0] truncate">{rule.prompt}</p>
                  )}
                  {rule.label && rule.prompt && (
                    <p className="text-xs text-[#5a4042] truncate mt-0.5">{rule.prompt}</p>
                  )}
                </div>

                {/* Category badge */}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 flex-shrink-0 hidden sm:block">
                  {RULE_CATEGORIES.find(c => c.id === rule.category)?.label || 'General'}
                </span>

                {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-[#5a4042]" /> : <ChevronDownIcon className="w-4 h-4 text-[#5a4042]" />}
              </div>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[rgba(90,64,66,0.2)]">
                  <div className="pt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="lbl">Label</label>
                      <input
                        className="inp"
                        placeholder="e.g. No corporate jargon"
                        value={rule.label}
                        onChange={e => updateRule(rule.id, { label: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="lbl">Category</label>
                      <select
                        className="sel"
                        value={rule.category}
                        onChange={e => updateRule(rule.id, { category: e.target.value as RuleCategory })}
                      >
                        {RULE_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="lbl">Rule Instructions</label>
                    <textarea
                      className="ta"
                      rows={3}
                      placeholder="Describe what the AI should do or avoid..."
                      value={rule.prompt}
                      onChange={e => updateRule(rule.id, { prompt: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="lbl">Priority</label>
                      <select
                        className="sel"
                        value={rule.priority}
                        onChange={e => updateRule(rule.id, { priority: e.target.value as RulePriority })}
                      >
                        {RULE_PRIORITIES.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="lbl">Frequency</label>
                      <select
                        className="sel"
                        value={rule.frequency}
                        onChange={e => updateRule(rule.id, { frequency: e.target.value as RuleFrequency })}
                      >
                        {RULE_FREQUENCIES.map(f => (
                          <option key={f.id} value={f.id}>{f.label} ({FREQUENCY_LABELS[f.id]})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="lbl">Applies To</label>
                      <select
                        className="sel"
                        value={rule.appliesTo}
                        onChange={e => updateRule(rule.id, { appliesTo: e.target.value as 'caption' | 'blog' | 'both' })}
                      >
                        <option value="caption">Captions only</option>
                        <option value="blog">Blog posts only</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="lbl">Platform Conditions (leave empty for all platforms)</label>
                    <div className="flex gap-2 flex-wrap">
                      {PLATFORM_OPTIONS.map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.platforms.includes(p)}
                            onChange={() => {
                              const next = rule.platforms.includes(p)
                                ? rule.platforms.filter(x => x !== p)
                                : [...rule.platforms, p]
                              updateRule(rule.id, { platforms: next })
                            }}
                            className="w-3.5 h-3.5 accent-[#ff5473]"
                          />
                          <span className="text-xs capitalize text-[#e6e1e1]">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(90,64,66,0.15)]">
                    <div className="flex gap-2">
                      <button onClick={() => duplicateRule(rule)} className="text-xs text-[#e1bec0] hover:text-white transition-colors">
                        Duplicate
                      </button>
                    </div>
                    <button onClick={() => removeRule(rule.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                      <TrashIcon className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
