-- ============================================================
-- CaptionCraft — Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New query
-- ============================================================

-- -----------------------------------------------
-- 1. WORKSPACES (one per admin / agency account)
-- -----------------------------------------------
create table public.workspaces (
  id uuid references auth.users(id) on delete cascade primary key,
  name text default 'My Agency',
  created_date timestamptz default now()
);

-- -----------------------------------------------
-- 2. PROFILES (one per user)
-- -----------------------------------------------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  email text,
  role text not null default 'admin',   -- 'admin' | 'team' | 'client'
  workspace_id uuid,                     -- admin's user_id; null for the admin themselves
  brand_id text                          -- client users only: their assigned brand ID
);

-- -----------------------------------------------
-- 3. APP DATA TABLES
-- Each stores app objects as JSONB + key columns for RLS filtering
-- -----------------------------------------------

create table public.brands (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  data jsonb not null
);

create table public.posts (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_profile_id text,     -- extracted for RLS: client can only see their brand's posts
  client_visible boolean default false,  -- extracted for RLS
  data jsonb not null
);

create table public.photos (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  data jsonb not null
);

create table public.clients (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  data jsonb not null
);

-- Settings stored as JSONB to avoid schema changes when new settings are added
create table public.settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  data jsonb default '{}'::jsonb
);

-- -----------------------------------------------
-- 4. AUTO-SETUP TRIGGER
-- Runs when a new user signs up or accepts an invite
-- -----------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  p_role text;
  p_workspace_id uuid;
  p_brand_id text;
begin
  -- Read metadata set during invite (raw_user_meta_data) or signup (raw_app_meta_data)
  p_role := coalesce(
    new.raw_user_meta_data->>'role',
    new.raw_app_meta_data->>'role',
    'admin'   -- first user to sign up becomes admin of their own workspace
  );
  p_workspace_id := coalesce(
    (new.raw_user_meta_data->>'workspace_id')::uuid,
    (new.raw_app_meta_data->>'workspace_id')::uuid
  );
  p_brand_id := coalesce(
    new.raw_user_meta_data->>'brand_id',
    new.raw_app_meta_data->>'brand_id'
  );

  -- Create the profile row
  insert into public.profiles (id, display_name, email, role, workspace_id, brand_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    p_role,
    case when p_role = 'admin' then new.id else p_workspace_id end,
    p_brand_id
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        email        = excluded.email,
        role         = excluded.role,
        workspace_id = excluded.workspace_id,
        brand_id     = excluded.brand_id;

  -- If this is an admin, create their workspace + settings rows
  if p_role = 'admin' then
    insert into public.workspaces (id) values (new.id) on conflict do nothing;
    insert into public.settings (workspace_id) values (new.id) on conflict do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------
-- 5. ROW LEVEL SECURITY
-- -----------------------------------------------
alter table public.workspaces enable row level security;
alter table public.profiles   enable row level security;
alter table public.brands     enable row level security;
alter table public.posts      enable row level security;
alter table public.photos     enable row level security;
alter table public.clients    enable row level security;
alter table public.settings   enable row level security;

-- Helper: returns the workspace_id the current user belongs to
-- (for admin = their own id; for team/client = their workspace_id)
create or replace function public.my_workspace_id() returns uuid as $$
  select case
    when (select role from public.profiles where id = auth.uid()) = 'admin'
      then auth.uid()
    else
      (select workspace_id from public.profiles where id = auth.uid())
  end;
$$ language sql security definer stable;

-- WORKSPACES
drop policy if exists "members read workspace" on public.workspaces;
create policy "members read workspace" on public.workspaces
  for select using (id = public.my_workspace_id());

drop policy if exists "admin update workspace" on public.workspaces;
create policy "admin update workspace" on public.workspaces
  for update using (
    id = auth.uid()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- PROFILES
drop policy if exists "read workspace profiles" on public.profiles;
create policy "read workspace profiles" on public.profiles
  for select using (
    workspace_id = public.my_workspace_id() or id = auth.uid()
  );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles
  for all using (
    (select role from public.profiles p2 where p2.id = auth.uid()) = 'admin'
    and workspace_id = auth.uid()
  );

-- BRANDS (admin + team read/write; clients have no access)
drop policy if exists "admin team brands" on public.brands;
create policy "admin team brands" on public.brands
  for all using (
    workspace_id = public.my_workspace_id()
    and (select role from public.profiles where id = auth.uid()) in ('admin','team')
  );

-- POSTS
drop policy if exists "read posts" on public.posts;
create policy "read posts" on public.posts
  for select using (
    workspace_id = public.my_workspace_id()
    and (
      -- admin + team see all posts
      (select role from public.profiles where id = auth.uid()) in ('admin','team')
      or
      -- clients only see their brand's client_visible posts
      (
        (select role from public.profiles where id = auth.uid()) = 'client'
        and brand_profile_id = (select brand_id from public.profiles where id = auth.uid())
        and client_visible = true
      )
    )
  );

drop policy if exists "admin team write posts" on public.posts;
create policy "admin team write posts" on public.posts
  for all using (
    workspace_id = public.my_workspace_id()
    and (select role from public.profiles where id = auth.uid()) in ('admin','team')
  );

-- PHOTOS (admin + team only)
drop policy if exists "admin team photos" on public.photos;
create policy "admin team photos" on public.photos
  for all using (
    workspace_id = public.my_workspace_id()
    and (select role from public.profiles where id = auth.uid()) in ('admin','team')
  );

-- CLIENTS (admin only)
drop policy if exists "admin clients" on public.clients;
create policy "admin clients" on public.clients
  for all using (
    workspace_id = public.my_workspace_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- SETTINGS (admin read/write; team read-only for API key access)
drop policy if exists "admin write settings" on public.settings;
create policy "admin write settings" on public.settings
  for all using (
    workspace_id = auth.uid()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "team read settings" on public.settings;
create policy "team read settings" on public.settings
  for select using (
    workspace_id = public.my_workspace_id()
    and (select role from public.profiles where id = auth.uid()) in ('admin','team')
  );

-- ============================================================
-- SETUP COMPLETE
--
-- Next steps:
-- 1. Supabase → Authentication → Providers → Email
--    → Disable "Enable email signups" (prevent self-registration)
-- 2. Supabase → Authentication → Email → enable "Confirm email"
-- 3. Supabase → Authentication → URL Configuration
--    → Set Site URL to your Netlify domain
-- 4. Supabase → Authentication → Users → "Invite user"
--    → Enter YOUR email to create your admin account
-- 5. Copy your Project URL and anon key into captioncraft.html
-- 6. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to Netlify env vars
-- ============================================================
