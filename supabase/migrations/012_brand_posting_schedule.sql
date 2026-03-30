-- Add posting schedule and buffer profile fields to workspace_brands
ALTER TABLE workspace_brands
  ADD COLUMN IF NOT EXISTS posting_days text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS posting_time text DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS buffer_profile_ids text[] DEFAULT '{}';
