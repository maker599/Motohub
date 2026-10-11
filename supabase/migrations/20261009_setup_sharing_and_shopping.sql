alter table public.saved_setups add column if not exists share_token uuid unique;

create or replace function public.get_shared_setup(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'name', setup.name,
    'engine', setup.engine,
    'goal', setup.goal,
    'setup', setup.setup,
    'created_at', setup.created_at
  )
  from public.saved_setups as setup
  where setup.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_shared_setup(uuid) from public;
grant execute on function public.get_shared_setup(uuid) to anon, authenticated;

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  exchange_rate numeric(10, 4) not null default 4.3775 check (exchange_rate > 0),
  shipping_by_store jsonb not null default '{}'::jsonb check (jsonb_typeof(shipping_by_store) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopping_lists_user_updated_idx
  on public.shopping_lists (user_id, updated_at desc);

alter table public.shopping_lists enable row level security;

drop policy if exists "users manage own shopping lists" on public.shopping_lists;
create policy "users manage own shopping lists"
  on public.shopping_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.shopping_lists to authenticated;