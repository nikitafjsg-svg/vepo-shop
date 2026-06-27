create table if not exists public.shop_products (
  id text primary key,
  name text not null,
  category text not null,
  brand text not null,
  series text,
  price numeric not null default 0,
  sku text,
  featured boolean default false,
  stock integer default 1,
  available boolean default true,
  image text,
  "createdAt" text,
  created_at timestamptz default now()
);

create table if not exists public.shop_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.shop_products enable row level security;
alter table public.shop_settings enable row level security;

drop policy if exists "Public shop products access" on public.shop_products;
create policy "Public shop products access"
on public.shop_products
for all
to anon
using (true)
with check (true);

drop policy if exists "Public shop settings access" on public.shop_settings;
create policy "Public shop settings access"
on public.shop_settings
for all
to anon
using (true)
with check (true);

do $$
begin
  alter publication supabase_realtime add table public.shop_products;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.shop_settings;
exception when duplicate_object then
  null;
end $$;
