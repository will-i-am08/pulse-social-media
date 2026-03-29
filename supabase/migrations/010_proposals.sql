create table if not exists proposals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  type text not null default 'proposal',
  client_name text default '',
  client_email text default '',
  brand_id uuid references workspace_brands(id) on delete set null,
  content jsonb not null default '[]',
  status text not null default 'draft',
  start_date date,
  end_date date,
  renewal_date date,
  total_value numeric(12,2) default 0,
  signature_client text,
  signature_agency text,
  signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table proposals enable row level security;

create policy "users own their proposals"
  on proposals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists proposals_user_updated
  on proposals (user_id, updated_at desc);

create index if not exists proposals_user_status
  on proposals (user_id, status);

create index if not exists proposals_user_renewal
  on proposals (user_id, renewal_date)
  where renewal_date is not null;
