create table if not exists blog_brands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  tagline text default 'Blog Dashboard',
  business_name text default '',
  location text default '',
  website text default '',
  industry text default '',
  primary_color text default '#0d9488',
  brand_voice text default '',
  focus_areas text[] default '{}',
  author_name text default '',
  blog_path text default '/blog',
  github_repo text default '',
  github_branch text default 'main',
  github_folder text default 'posts',
  claude_key_enc text,
  claude_key_iv text,
  claude_key_tag text,
  github_token_enc text,
  github_token_iv text,
  github_token_tag text,
  created_at timestamptz default now()
);

alter table blog_brands enable row level security;

create policy "users own their blog brands"
  on blog_brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
