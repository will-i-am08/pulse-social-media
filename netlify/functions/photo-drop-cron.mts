import type { Config } from "@netlify/functions"
import { createClient } from "@supabase/supabase-js"

export default async (req: Request) => {
  const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = Netlify.env.get("SUPABASE_SERVICE_KEY")
  const siteUrl = Netlify.env.get("NEXT_PUBLIC_SITE_URL") || "https://pulsesocialmedia.com.au"

  if (!supabaseUrl || !supabaseKey) {
    console.log("Missing Supabase env vars")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Find due schedules
  const now = new Date().toISOString()
  const { data: dueSchedules, error } = await supabase
    .from("photo_drop_schedules")
    .select("*")
    .eq("enabled", true)
    .lte("next_run_at", now)

  if (error || !dueSchedules?.length) {
    console.log(`No due schedules found. Error: ${error?.message || "none"}`)
    return
  }

  console.log(`Found ${dueSchedules.length} due schedule(s)`)

  for (const schedule of dueSchedules) {
    try {
      // Call the photo-drop run API as the user
      // Since this is a server-side function, we use the service key to act on behalf of the user
      const { data: photoRows } = await supabase
        .from("photos")
        .select("id, data")
        .eq("workspace_id", schedule.user_id)

      if (!photoRows?.length) {
        console.log(`No photos for user ${schedule.user_id}`)
        continue
      }

      // Filter unprocessed photos
      const unprocessed = photoRows
        .map(r => ({ dbId: r.id, ...(r.data as Record<string, unknown>) }))
        .filter(p => !p.processed)
        .slice(0, schedule.batch_size || 5)

      if (unprocessed.length === 0) {
        console.log(`No unprocessed photos for brand ${schedule.brand_id}`)
        continue
      }

      // Fetch brand
      const { data: brand } = await supabase
        .from("workspace_brands")
        .select("name, brand_voice, tone, output_length, include_hashtags, include_emojis")
        .eq("id", schedule.brand_id)
        .eq("user_id", schedule.user_id)
        .single()

      if (!brand) continue

      // Get Claude API key
      const { data: settings } = await supabase
        .from("account_settings")
        .select("claude_key_enc, claude_key_iv, claude_key_tag")
        .eq("user_id", schedule.user_id)
        .single()

      if (!settings?.claude_key_enc) {
        console.log(`No Claude key for user ${schedule.user_id}`)
        continue
      }

      // We can't decrypt here without the encryption secret, so we'll trigger the run API via HTTP
      // This is simpler and reuses existing auth + decrypt logic
      console.log(`Schedule ${schedule.id}: Would process ${unprocessed.length} photos for ${brand.name}. Triggering via API not possible from cron without user session. Sending notification instead.`)

      // Create notification to remind user
      await supabase.from("notifications").insert({
        user_id: schedule.user_id,
        type: "reminder",
        title: `Photo Drop: ${unprocessed.length} photos ready for ${brand.name}`,
        message: `Your scheduled Photo Drop has ${unprocessed.length} unprocessed photo${unprocessed.length !== 1 ? "s" : ""} ready. Open Photo Drop to process them.`,
        link: "/automations/photo-drop",
      })

      // Update schedule timing
      const nextRun = calcNextRun(schedule.frequency, schedule.day_of_week)
      await supabase
        .from("photo_drop_schedules")
        .update({ last_run_at: now, next_run_at: nextRun })
        .eq("id", schedule.id)

      console.log(`Schedule ${schedule.id}: Notification sent, next run ${nextRun}`)
    } catch (e) {
      console.error(`Schedule ${schedule.id} error:`, e)
    }
  }
}

function calcNextRun(frequency: string, dayOfWeek: number): string {
  const now = new Date()
  const target = new Date(now)
  const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7
  target.setDate(now.getDate() + diff)
  target.setHours(9, 0, 0, 0)

  if (frequency === "fortnightly") {
    target.setDate(target.getDate() + 7)
  } else if (frequency === "monthly") {
    target.setMonth(target.getMonth() + 1)
    const monthTarget = new Date(target.getFullYear(), target.getMonth(), 1)
    while (monthTarget.getDay() !== dayOfWeek) monthTarget.setDate(monthTarget.getDate() + 1)
    return monthTarget.toISOString()
  }

  return target.toISOString()
}

export const config: Config = {
  schedule: "0 9 * * *"
}
