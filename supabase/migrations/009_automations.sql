-- Automations table
create table if not exists automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text default '',
  steps jsonb not null default '[]',
  trigger_type text not null default 'manual',
  trigger_config jsonb default '{}',
  is_enabled boolean default true,
  last_run_at timestamptz,
  last_run_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table automations enable row level security;

create policy "users own their automations"
  on automations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists automations_user_updated
  on automations (user_id, updated_at desc);

-- Automation run history
create table if not exists automation_runs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references automations(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  status text not null default 'running',
  trigger_source text default 'manual',
  steps_log jsonb default '[]',
  started_at timestamptz default now(),
  completed_at timestamptz,
  error_message text
);

alter table automation_runs enable row level security;

create policy "users own their automation runs"
  on automation_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists automation_runs_user_started
  on automation_runs (user_id, started_at desc);

create index if not exists automation_runs_automation
  on automation_runs (automation_id, started_at desc);
