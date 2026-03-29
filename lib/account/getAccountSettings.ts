import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/geo/encrypt'

export async function getDecryptedClaudeKey(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('account_settings')
    .select('claude_key_enc, claude_key_iv, claude_key_tag')
    .eq('user_id', userId)
    .single()
  if (!data?.claude_key_enc || !data.claude_key_iv || !data.claude_key_tag) return null
  try {
    return decrypt(data.claude_key_enc, data.claude_key_iv, data.claude_key_tag)
  } catch {
    return null
  }
}
