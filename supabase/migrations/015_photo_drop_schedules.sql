-- Photo Drop auto-schedules
CREATE TABLE IF NOT EXISTS photo_drop_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  brand_id text NOT NULL,
  frequency text NOT NULL DEFAULT 'weekly',
  day_of_week int DEFAULT 1,
  batch_size int DEFAULT 5,
  platforms text[] DEFAULT '{"instagram"}',
  prompt text DEFAULT '',
  enabled boolean DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pds_user ON photo_drop_schedules(user_id);
CREATE INDEX idx_pds_next_run ON photo_drop_schedules(enabled, next_run_at);

ALTER TABLE photo_drop_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedules"
  ON photo_drop_schedules FOR ALL USING (auth.uid() = user_id);
