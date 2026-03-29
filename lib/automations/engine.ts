import { createClient } from '@/lib/supabase/server'
import { ACTION_REGISTRY } from './actions'
import type { Automation, AutomationStep, StepLog, TriggerType } from './types'

function rowToAutomation(row: Record<string, unknown>): Automation {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    steps: (row.steps as AutomationStep[]) || [],
    triggerType: (row.trigger_type as TriggerType) || 'manual',
    triggerConfig: (row.trigger_config as Record<string, string>) || {},
    isEnabled: row.is_enabled as boolean,
    lastRunAt: row.last_run_at as string | undefined,
    lastRunStatus: row.last_run_status as Automation['lastRunStatus'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function executeAutomation(
  automationId: string,
  userId: string,
  triggerSource: TriggerType,
  cookies: string
): Promise<{ runId: string; status: 'success' | 'failed'; stepsLog: StepLog[] }> {
  const supabase = await createClient()

  // Fetch automation
  const { data: row } = await supabase
    .from('automations')
    .select('*')
    .eq('id', automationId)
    .eq('user_id', userId)
    .single()

  if (!row) throw new Error('Automation not found')
  const automation = rowToAutomation(row)

  // Create run record
  const { data: run, error: runErr } = await supabase
    .from('automation_runs')
    .insert({ automation_id: automationId, user_id: userId, trigger_source: triggerSource })
    .select('id')
    .single()

  if (runErr || !run) throw new Error('Could not create run record')

  // Mark automation as running
  await supabase.from('automations').update({ last_run_status: 'running' }).eq('id', automationId)

  const stepsLog: StepLog[] = []
  let overallStatus: 'success' | 'failed' = 'success'
  let errorMessage: string | undefined

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  for (let i = 0; i < automation.steps.length; i++) {
    const step = automation.steps[i]
    const actionDef = ACTION_REGISTRY[step.actionType]
    const startTime = Date.now()

    if (!actionDef) {
      stepsLog.push({
        stepIndex: i,
        actionType: step.actionType,
        label: step.label,
        status: 'failed',
        error: `Unknown action type: ${step.actionType}`,
        durationMs: 0,
      })
      overallStatus = 'failed'
      errorMessage = `Step ${i + 1} failed: Unknown action type`
      break
    }

    // Handle internal notification action
    if (actionDef.endpoint === '__internal__') {
      stepsLog.push({
        stepIndex: i,
        actionType: step.actionType,
        label: step.label,
        status: 'success',
        output: { message: step.config.message || 'Notification sent' },
        durationMs: Date.now() - startTime,
      })
      continue
    }

    try {
      const body = actionDef.buildBody(step.config)
      const res = await fetch(`${baseUrl}${actionDef.endpoint}`, {
        method: actionDef.method,
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      const durationMs = Date.now() - startTime

      if (!res.ok) {
        stepsLog.push({
          stepIndex: i,
          actionType: step.actionType,
          label: step.label,
          status: 'failed',
          error: data.error || `HTTP ${res.status}`,
          durationMs,
        })
        overallStatus = 'failed'
        errorMessage = `Step ${i + 1} (${step.label}) failed: ${data.error || `HTTP ${res.status}`}`
        break
      }

      stepsLog.push({
        stepIndex: i,
        actionType: step.actionType,
        label: step.label,
        status: 'success',
        output: data,
        durationMs,
      })
    } catch (err: any) {
      stepsLog.push({
        stepIndex: i,
        actionType: step.actionType,
        label: step.label,
        status: 'failed',
        error: err.message,
        durationMs: Date.now() - startTime,
      })
      overallStatus = 'failed'
      errorMessage = `Step ${i + 1} (${step.label}) failed: ${err.message}`
      break
    }
  }

  const now = new Date().toISOString()

  // Update run record
  await supabase
    .from('automation_runs')
    .update({
      status: overallStatus,
      steps_log: stepsLog,
      completed_at: now,
      error_message: errorMessage || null,
    })
    .eq('id', run.id)

  // Update automation
  await supabase
    .from('automations')
    .update({ last_run_at: now, last_run_status: overallStatus })
    .eq('id', automationId)

  return { runId: run.id, status: overallStatus, stepsLog }
}
