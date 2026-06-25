create table if not exists public.chat_conversations (
  id text primary key,
  customer_name text not null,
  customer_phone text default '',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  conversation_id text not null references public.chat_conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin', 'system')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "chat conversations demo access"
on public.chat_conversations for all
to anon
using (true)
with check (true);

create policy "chat messages demo access"
on public.chat_messages for all
to anon
using (true)
with check (true);

do $$ begin
  alter publication supabase_realtime add table public.chat_conversations;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
end $$;
