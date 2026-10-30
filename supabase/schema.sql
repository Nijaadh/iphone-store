-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

-- Products (iPhones)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  model text not null,                       -- e.g. "iPhone 13 Pro"
  storage_gb int not null,
  color text,
  condition text not null check (condition in ('new', 'used')),
  battery_health int check (battery_health between 1 and 100), -- used phones
  imei text,
  price_lkr numeric(12,2) not null check (price_lkr >= 0),
  description text,
  images text[] not null default '{}',       -- public URLs from storage
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  payment_method text not null check (payment_method in ('cod', 'payhere')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_lkr numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  price_lkr numeric(12,2) not null
);

create index if not exists products_status_idx on public.products (status);
create index if not exists products_condition_idx on public.products (condition);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- Admin = a user whose app_metadata contains {"role": "admin"}.
-- After creating your admin user in Authentication -> Users, run:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'YOUR-EMAIL';
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products: anyone can read, only admin can change.
create policy "products are public" on public.products for select using (true);
create policy "admin manages products" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- Orders: only admin can read/update. Checkout will create orders from a
-- server action using the service role key (added on Day 5).
create policy "admin manages orders" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin manages order items" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

-- Image storage bucket (public read, admin write)
insert into storage.buckets (id, name, public)
values ('phone-images', 'phone-images', true)
on conflict (id) do nothing;

create policy "phone images are public" on storage.objects for select
  using (bucket_id = 'phone-images');
create policy "admin uploads phone images" on storage.objects for insert
  with check (bucket_id = 'phone-images' and public.is_admin());
create policy "admin updates phone images" on storage.objects for update
  using (bucket_id = 'phone-images' and public.is_admin());
create policy "admin deletes phone images" on storage.objects for delete
  using (bucket_id = 'phone-images' and public.is_admin());
