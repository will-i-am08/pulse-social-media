-- Add encrypted Buffer access token columns to account_settings
ALTER TABLE account_settings
  ADD COLUMN IF NOT EXISTS buffer_token_enc text,
  ADD COLUMN IF NOT EXISTS buffer_token_iv  text,
  ADD COLUMN IF NOT EXISTS buffer_token_tag text;
