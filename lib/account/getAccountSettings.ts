import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/geo/encrypt'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getDecryptedClaudeKey(userId: string, client?: SupabaseClient): Promise<string | null> {
  const supabase = client || await createClient()
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

export async function getDecryptedBufferToken(userId: string, client?: SupabaseClient): Promise<string | null> {
  const supabase = client || await createClient()
  const { data } = await supabase
    .from('account_settings')
    .select('buffer_token_enc, buffer_token_iv, buffer_token_tag')
    .eq('user_id', userId)
    .single()
  if (!data?.buffer_token_enc || !data.buffer_token_iv || !data.buffer_token_tag) return null
  try {
    return decrypt(data.buffer_token_enc, data.buffer_token_iv, data.buffer_token_tag)
  } catch {
    return null
  }
}

export async function getDecryptedBannerbearKey(userId: string, client?: SupabaseClient): Promise<string | null> {
  const supabase = client || await createClient()
  const { data } = await supabase
    .from('account_settings')
    .select('bannerbear_key_enc, bannerbear_key_iv, bannerbear_key_tag')
    .eq('user_id', userId)
    .single()
  if (!data?.bannerbear_key_enc || !data.bannerbear_key_iv || !data.bannerbear_key_tag) return null
  try {
    return decrypt(data.bannerbear_key_enc, data.bannerbear_key_iv, data.bannerbear_key_tag)
  } catch {
    return null
  }
}
