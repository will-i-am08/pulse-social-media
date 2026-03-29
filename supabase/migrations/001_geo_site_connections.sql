-- GEO Command Center: site connections
create table if not exists geo_site_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text not null,
  site_url      text not null,
  platform      text not null check (platform in ('wordpress','shopify','github','static')),
  -- Encrypted API key (AES-256-GCM)
  api_key_enc   text,
  api_key_iv    text,
  api_key_tag   text,
  -- WordPress-specific
  wp_username   text,
  -- Shopify-specific
  shopify_shop  text,
  -- GitHub-specific
  github_owner  text,
  github_repo   text,
  github_branch text default 'main',
  created_at    timestamptz default now()
);

alter table geo_site_connections enable row level security;

create policy "users own their connections"
  on geo_site_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on geo_site_connections(user_id);
