-- Account-level settings: Claude API key + Cloudinary config
-- Shared across all apps for users logged into the same account

CREATE TABLE IF NOT EXISTS account_settings (
  user_id                  uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  -- Claude API key (AES-256-GCM encrypted)
  claude_key_enc           text,
  claude_key_iv            text,
  claude_key_tag           text,
  -- Cloudinary (plaintext — public config used client-side)
  cloudinary_cloud_name    text DEFAULT '',
  cloudinary_upload_preset text DEFAULT '',
  updated_at               timestamptz DEFAULT now()
);

ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their account settings"
  ON account_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
