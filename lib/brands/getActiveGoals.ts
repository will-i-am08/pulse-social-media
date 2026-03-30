import { createClient } from '@/lib/supabase/server'
import type { BrandGoal } from '@/lib/types'

export async function getActiveGoals(brandId: string, userId: string): Promise<BrandGoal[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('brand_goals')
    .select('*')
    .eq('brand_id', brandId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('period', { ascending: true })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    brandId: row.brand_id,
    title: row.title || '',
    description: row.description || '',
    period: (row.period || 'monthly') as BrandGoal['period'],
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  }))
}

/** Format active goals as a prompt section for AI content generation */
export function goalsToPromptSection(goals: BrandGoal[]): string {
  if (goals.length === 0) return ''
  const lines = goals.map(g =>
    `- [${g.period.charAt(0).toUpperCase() + g.period.slice(1)}] ${g.title}${g.description ? ' — ' + g.description : ''}`
  )
  return `\nCurrent brand goals/focuses (align content with these):\n${lines.join('\n')}\n`
}
