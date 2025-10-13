-- Enable required extensions
create extension if not exists pgcrypto;

-- 1) Tables
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  email text,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id) on delete cascade,
  published boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  sku text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- Ensure new columns exist on older databases
alter table products add column if not exists slug text unique;
alter table products add column if not exists sku text;
alter table products add column if not exists in_stock boolean not null default true;

-- Banners (for homepage hero)
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image text not null,
  link text,
  published boolean default true,
  created_at timestamptz not null default now()
);

-- Promo codes
create table if not exists promos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Key-value settings (e.g., currency rates)
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- 2) Insert admin user `root` with bcrypt hash for password `root`
-- Use pgcrypto's crypt() with bcrypt (blowfish) salt
-- Ensure optional columns exist on older databases
alter table admins add column if not exists email text;
alter table admins add column if not exists name text;
insert into admins (username, password_hash, email, name)
values ('root', crypt('root', gen_salt('bf', 10)), 'admin@example.com', 'Administrator')
on conflict (username) do nothing;

-- 3) Seed categories
insert into categories (name, slug)
values
  ('Gaming', 'gaming'),
  ('Softwares', 'softwares')
on conflict (slug) do nothing;

-- 4) Simple RLS
alter table admins enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table banners enable row level security;
alter table promos enable row level security;
alter table settings enable row level security;

-- No public access to admins (service key must be used server-side)
drop policy if exists admins_no_access on admins;
create policy admins_no_access on admins
  for select to anon using (false);
drop policy if exists admins_no_access_auth on admins;
create policy admins_no_access_auth on admins
  for select to authenticated using (false);

-- Public read for categories and products
drop policy if exists categories_read_anon on categories;
create policy categories_read_anon on categories
  for select to anon using (true);
drop policy if exists categories_read_auth on categories;
create policy categories_read_auth on categories
  for select to authenticated using (true);

drop policy if exists products_read_anon on products;
create policy products_read_anon on products
  for select to anon using (true);
drop policy if exists products_read_auth on products;
create policy products_read_auth on products
  for select to authenticated using (true);

drop policy if exists banners_read_anon on banners;
create policy banners_read_anon on banners
  for select to anon using (true);
drop policy if exists banners_read_auth on banners;
create policy banners_read_auth on banners
  for select to authenticated using (true);

drop policy if exists promos_read_anon on promos;
create policy promos_read_anon on promos
  for select to anon using (true);
drop policy if exists promos_read_auth on promos;
create policy promos_read_auth on promos
  for select to authenticated using (true);

-- Public read for settings (only for GET)
drop policy if exists settings_read_anon on settings;
create policy settings_read_anon on settings
  for select to anon using (true);
drop policy if exists settings_read_auth on settings;
create policy settings_read_auth on settings
  for select to authenticated using (true);

-- No public writes to settings (server-side via service key bypasses RLS)

-- Optional: allow service role to manage data (checked by server via service key)
-- Note: service role bypasses RLS, so no explicit write policies are required for server-side usage.