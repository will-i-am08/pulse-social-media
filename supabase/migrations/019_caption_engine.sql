-- Caption feedback table — stores per-caption ratings, tags, and notes.
-- Powers the feedback loop: highly-rated caption patterns inform future generation,
-- low-rated patterns get avoided.
CREATE TABLE IF NOT EXISTS caption_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  brand_id uuid NOT NULL,
  post_id text NOT NULL,              -- references posts.data->>'id'
  caption_text text NOT NULL,         -- snapshot of caption at time of rating
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  tags text[] DEFAULT '{}',           -- quick feedback tags: 'great-hook', 'weak-cta', etc.
  notes text DEFAULT '',
  variation_preset text DEFAULT '',   -- which preset was used to generate
  platforms text[] DEFAULT '{}',      -- which platforms this was for
  created_at timestamptz DEFAULT now()
);

ALTER TABLE caption_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their caption feedback"
  ON caption_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS caption_feedback_brand_id ON caption_feedback (brand_id);
CREATE INDEX IF NOT EXISTS caption_feedback_user_brand ON caption_feedback (user_id, brand_id);

-- Add posting_instructions to workspace_brands if not already present
ALTER TABLE workspace_brands
  ADD COLUMN IF NOT EXISTS posting_instructions text DEFAULT '';

-- Add default_aspect_ratio if not present
ALTER TABLE workspace_brands
  ADD COLUMN IF NOT EXISTS default_aspect_ratio text DEFAULT '';
