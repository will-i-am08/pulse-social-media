-- Unified workspace brands table — single source of truth for all apps
-- Replaces both the CaptionCraft 'brands' table (data jsonb) and 'blog_brands' table.
-- All apps (CaptionCraft, Blog Engine, GEO, Brand Research) read/write from here.

CREATE TABLE IF NOT EXISTS workspace_brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,

  -- Core identity
  name text NOT NULL,
  tagline text DEFAULT '',
  business_name text DEFAULT '',
  industry text DEFAULT '',
  location text DEFAULT '',
  website text DEFAULT '',
  primary_color text DEFAULT '#8b5cf6',
  logo_url text DEFAULT '',

  -- Blog config
  author_name text DEFAULT '',
  blog_path text DEFAULT '/blog',

  -- Brand voice & content strategy
  brand_voice text DEFAULT '',
  tone text DEFAULT 'professional', -- professional|casual|playful|luxury|inspirational|friendly
  output_length text DEFAULT 'medium', -- short|medium|long
  focus_areas text[] DEFAULT '{}',

  -- Social media config
  include_hashtags boolean DEFAULT true,
  include_emojis boolean DEFAULT false,
  social_handles jsonb DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  buffer_channels jsonb DEFAULT '[]',

  -- Research & positioning
  mission text DEFAULT '',
  values text DEFAULT '',
  target_audience text DEFAULT '',
  unique_value_prop text DEFAULT '',
  competitors text DEFAULT '',
  key_messages text[] DEFAULT '{}',

  -- Replicate image model training
  replicate_model_version text DEFAULT '',
  training_status text DEFAULT 'idle', -- idle|training|succeeded|failed
  training_id text DEFAULT '',
  trigger_word text DEFAULT '',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspace_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their brands"
  ON workspace_brands FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS workspace_brands_user_id ON workspace_brands (user_id);

-- Brand research reports — multiple reports can be attached to each brand
CREATE TABLE IF NOT EXISTS brand_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES workspace_brands(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL DEFAULT 'Research Report',
  -- ai_research | competitor | audience | market | manual
  report_type text DEFAULT 'ai_research',
  content text DEFAULT '',
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brand_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their brand reports"
  ON brand_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS brand_reports_brand_id ON brand_reports (brand_id);

-- Drop the old blog_brands table (replaced by workspace_brands)
-- NOTE: If blog_brands table was never created (migrations 004/005 not run), this is a no-op
DROP TABLE IF EXISTS blog_brands CASCADE;
