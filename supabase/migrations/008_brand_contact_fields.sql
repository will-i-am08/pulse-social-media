-- Add contact fields to workspace_brands so captions can rotate between
-- website, phone, and address rather than always defaulting to the website.

ALTER TABLE workspace_brands
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text DEFAULT '';
