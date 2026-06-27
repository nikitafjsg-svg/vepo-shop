create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  brand text not null,
  series text default 'Telegram bot',
  price integer not null check (price >= 0),
  sku text unique,
  image text,
  featured boolean default false,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

drop policy if exists "Public products are readable" on public.products;
create policy "Public products are readable"
on public.products
for select
to anon
using (true);
