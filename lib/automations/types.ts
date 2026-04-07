export type ActionType =
  | 'generate-blog-ideas'
  | 'generate-blog-post'
  | 'publish-blog-post'
  | 'seo-audit-onpage'
  | 'seo-audit-technical'
  | 'keyword-research'
  | 'ai-visibility-audit'
  | 'generate-image'
  | 'generate-social-caption'
  | 'create-social-post'
  | 'create-posts-from-folder'
  | 'send-notification'
  | 'ai-prompt'

export interface AutomationStep {
  id: string
  actionType: ActionType
  label: string
  config: Record<string, unknown>
}

export type TriggerType = 'manual' | 'schedule' | 'event'

export interface Automation {
  id: string
  userId: string
  name: string
  description: string
  steps: AutomationStep[]
  triggerType: TriggerType
  triggerConfig: { cron?: string; event?: string }
  isEnabled: boolean
  lastRunAt?: string
  lastRunStatus?: 'success' | 'failed' | 'running'
  createdAt: string
  updatedAt: string
}

export interface StepLog {
  stepIndex: number
  actionType: ActionType
  label: string
  status: 'success' | 'failed' | 'skipped'
  output?: unknown
  error?: string
  durationMs: number
}

export interface AutomationRun {
  id: string
  automationId: string
  userId: string
  status: 'running' | 'success' | 'failed'
  triggerSource: TriggerType
  stepsLog: StepLog[]
  startedAt: string
  completedAt?: string
  errorMessage?: string
  automationName?: string
}

export const ACTION_LABELS: Record<ActionType, string> = {
  'generate-blog-ideas': 'Generate Blog Ideas',
  'generate-blog-post': 'Generate Blog Post',
  'publish-blog-post': 'Publish Blog Post',
  'seo-audit-onpage': 'On-Page SEO Audit',
  'seo-audit-technical': 'Technical SEO Audit',
  'keyword-research': 'Keyword Research',
  'ai-visibility-audit': 'AI Visibility Audit',
  'generate-image': 'Generate Image',
  'generate-social-caption': 'Generate Social Caption',
  'create-social-post': 'Create Social Post',
  'create-posts-from-folder': 'Create Posts from Folder',
  'send-notification': 'Send Notification',
  'ai-prompt': 'Custom AI Prompt',
}

export const SCHEDULE_PRESETS = [
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Daily at 9am', cron: '0 9 * * *' },
  { label: 'Daily at 6pm', cron: '0 18 * * *' },
  { label: 'Weekly on Monday', cron: '0 9 * * 1' },
  { label: 'Weekly on Friday', cron: '0 9 * * 5' },
  { label: 'First of month', cron: '0 9 1 * *' },
]
