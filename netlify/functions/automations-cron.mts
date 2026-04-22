import type { Config } from "@netlify/functions"
import { createClient } from "@supabase/supabase-js"

const FIELD_RANGES: [number, number][] = [
  [0, 59], [0, 23], [1, 31], [1, 12], [0, 6]
]

function parseField(raw: string, [min, max]: [number, number]): Set<number> {
  const out = new Set<number>()
  for (const chunk of raw.split(',')) {
    const [rangePart, stepPart] = chunk.split('/')
    const step = stepPart ? parseInt(stepPart, 10) : 1
    let lo = min, hi = max
    if (rangePart !== '*') {
      if (rangePart.includes('-')) {
        const [a, b] = rangePart.split('-').map(n => parseInt(n, 10))
        lo = a; hi = b
      } else {
        lo = hi = parseInt(rangePart, 10)
      }
    }
    for (let v = lo; v <= hi; v += step) out.add(v)
  }
  return out
}

function cronMatches(expr: string, date: Date): boolean {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  try {
    const sets = parts.map((p, i) => parseField(p, FIELD_RANGES[i]))
    const [minSet, hourSet, domSet, monSet, dowSet] = sets
    if (!minSet.has(date.getUTCMinutes())) return false
    if (!hourSet.has(date.getUTCHours())) return false
    if (!monSet.has(date.getUTCMonth() + 1)) return false
    const domRestricted = parts[2] !== '*'
    const dowRestricted = parts[4] !== '*'
    if (domRestricted && dowRestricted) {
      return domSet.has(date.getUTCDate()) || dowSet.has(date.getUTCDay())
    }
    return domSet.has(date.getUTCDate()) && dowSet.has(date.getUTCDay())
  } catch { return false }
}

function isDue(expr: string, now: Date, lastRunAt: string | null): boolean {
  if (!cronMatches(expr, now)) return false
  if (!lastRunAt) return true
  return (now.getTime() - new Date(lastRunAt).getTime()) >= 55_000
}

export default async () => {
  const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = Netlify.env.get("SUPABASE_SERVICE_KEY")
  const siteUrl = Netlify.env.get("NEXT_PUBLIC_SITE_URL") || "https://pulsesocialmedia.com.au"
  const cronSecret = Netlify.env.get("CRON_SECRET")

  if (!supabaseUrl || !supabaseKey || !cronSecret) {
    console.log("automations-cron: missing env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, CRON_SECRET)")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const now = new Date()

  const { data: automations, error } = await supabase
    .from("automations")
    .select("id, user_id, trigger_config, last_run_at, name")
    .eq("trigger_type", "schedule")
    .eq("is_enabled", true)

  if (error) {
    console.error("automations-cron: fetch error", error.message)
    return
  }

  if (!automations?.length) {
    console.log("automations-cron: no scheduled automations")
    return
  }

  const due = automations.filter(a => {
    const cron = (a.trigger_config as { cron?: string } | null)?.cron
    return cron && isDue(cron, now, a.last_run_at as string | null)
  })

  if (!due.length) {
    console.log(`automations-cron: ${automations.length} scheduled, 0 due at ${now.toISOString()}`)
    return
  }

  console.log(`automations-cron: firing ${due.length} automation(s)`)

  await Promise.all(due.map(async a => {
    try {
      const res = await fetch(`${siteUrl}/api/automations/cron-run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ automationId: a.id, userId: a.user_id }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error(`automations-cron: ${a.name} (${a.id}) failed — ${res.status} ${JSON.stringify(payload)}`)
      } else {
        console.log(`automations-cron: ${a.name} (${a.id}) → ${payload.status}`)
      }
    } catch (e: any) {
      console.error(`automations-cron: ${a.name} (${a.id}) error —`, e.message)
    }
  }))
}

export const config: Config = {
  schedule: "* * * * *"
}
