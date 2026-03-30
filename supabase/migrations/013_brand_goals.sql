-- Brand goals/focuses with time periods
CREATE TABLE IF NOT EXISTS brand_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES workspace_brands(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  period text NOT NULL DEFAULT 'monthly',
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brand_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their brand goals"
  ON brand_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS brand_goals_brand_id ON brand_goals (brand_id);
CREATE INDEX IF NOT EXISTS brand_goals_active ON brand_goals (brand_id, is_active, start_date, end_date);
