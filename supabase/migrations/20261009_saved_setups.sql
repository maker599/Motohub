create table if not exists public.saved_setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  engine text not null check (engine in ('Minarelli AM6', 'Derbi D50B0', 'Derbi D50B1')),
  goal text not null check (goal in ('daily', 'sport', 'race', 'track')),
  setup jsonb not null check (jsonb_typeof(setup) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists saved_setups_user_created_idx
  on public.saved_setups (user_id, created_at desc);

alter table public.saved_setups enable row level security;

drop policy if exists "users manage own saved setups" on public.saved_setups;
create policy "users manage own saved setups"
  on public.saved_setups
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, delete on public.saved_setups to authenticated;
