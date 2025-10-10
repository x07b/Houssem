-- Enable required extensions
create extension if not exists pgcrypto;

-- 1) Tables
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  title text not null,
  price numeric(10,2) not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

-- 2) Insert admin user `root` with bcrypt hash for password `root`
-- Use pgcrypto's crypt() with bcrypt (blowfish) salt
insert into admins (username, password_hash)
values ('root', crypt('root', gen_salt('bf', 10)))
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

-- No public access to admins (service key must be used server-side)
create policy if not exists admins_no_access on admins
  for select to anon using (false);
create policy if not exists admins_no_access_auth on admins
  for select to authenticated using (false);

-- Public read for categories and products
create policy if not exists categories_read_anon on categories
  for select to anon using (true);
create policy if not exists categories_read_auth on categories
  for select to authenticated using (true);

create policy if not exists products_read_anon on products
  for select to anon using (true);
create policy if not exists products_read_auth on products
  for select to authenticated using (true);
