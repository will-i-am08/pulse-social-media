create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  brand_id uuid references blog_brands(id) on delete cascade not null,
  slug text not null,
  title text not null default '',
  meta text default '',
  author text default '',
  content text default '',
  tags text default '',
  featured_image text,
  status text default 'draft',
  published_date text,
  word_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blog_posts enable row level security;

create policy "users own their blog posts"
  on blog_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists blog_posts_brand_updated
  on blog_posts (user_id, brand_id, updated_at desc);
