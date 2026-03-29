-- GEO Command Center: audit results
create table if not exists geo_audit_results (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  site_connection_id    uuid references geo_site_connections(id) on delete set null,
  site_url              text not null,
  audited_at            timestamptz default now(),
  citation_health_score integer not null check (citation_health_score between 0 and 100),
  overall_status        text not null check (overall_status in ('ai-cited','ai-shadowed','ai-blocked')),
  engine_scores         jsonb default '{}'::jsonb,
  suggested_changes     jsonb default '[]'::jsonb
);

alter table geo_audit_results enable row level security;

create policy "users own their audit results"
  on geo_audit_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on geo_audit_results(user_id, audited_at desc);
create index on geo_audit_results(site_connection_id);
