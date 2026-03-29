-- GEO Command Center: Agentic Commerce Protocol configs
create table if not exists geo_acp_configs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  site_connection_id  uuid references geo_site_connections(id) on delete cascade,
  ai_checkout_enabled boolean default false,
  -- Encrypted Stripe secret
  stripe_secret_enc   text,
  stripe_secret_iv    text,
  stripe_secret_tag   text,
  acp_endpoint_url    text,
  supported_agents    text[] default array[]::text[],
  product_map         jsonb default '{}'::jsonb,
  created_at          timestamptz default now()
);

alter table geo_acp_configs enable row level security;

create policy "users own their acp configs"
  on geo_acp_configs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on geo_acp_configs(user_id);
create index on geo_acp_configs(site_connection_id);
