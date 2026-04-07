-- Add OpenAI and Bannerbear encrypted key columns to account_settings
ALTER TABLE account_settings
  ADD COLUMN IF NOT EXISTS openai_key_enc text,
  ADD COLUMN IF NOT EXISTS openai_key_iv text,
  ADD COLUMN IF NOT EXISTS openai_key_tag text,
  ADD COLUMN IF NOT EXISTS bannerbear_key_enc text,
  ADD COLUMN IF NOT EXISTS bannerbear_key_iv text,
  ADD COLUMN IF NOT EXISTS bannerbear_key_tag text;
