create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  engine_cc integer,
  power_hp integer,
  motorcycle_type text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.garage_motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  nickname text,
  mileage integer,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, motorcycle_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.garage_motorcycles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "motorcycles are public" on public.motorcycles for select using (true);
create policy "users manage own garage" on public.garage_motorcycles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts are public" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "users manage own posts" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
