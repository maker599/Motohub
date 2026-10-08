create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, username text unique not null, created_at timestamptz not null default now());
create table if not exists public.motorcycles (id uuid primary key default gen_random_uuid(), slug text unique not null, brand text not null, model text not null, year integer not null, technical_description text, engine_cc integer, power_hp integer, motorcycle_type text, image_url text, created_at timestamptz not null default now());
create table if not exists public.garage_motorcycles (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, motorcycle_id uuid not null references public.motorcycles(id) on delete cascade, nickname text, mileage integer, notes text, model_year integer, color text, created_at timestamptz not null default now(), unique(user_id, motorcycle_id));
create table if not exists public.posts (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, content text not null check (char_length(content) between 1 and 2000), created_at timestamptz not null default now());
create table if not exists public.comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, content text not null check (char_length(content) between 1 and 1000), created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.garage_motorcycles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "profiles are public" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "motorcycles are public" on public.motorcycles;
drop policy if exists "users manage own garage" on public.garage_motorcycles;
drop policy if exists "posts are public" on public.posts;
drop policy if exists "users create own posts" on public.posts;
drop policy if exists "users manage own posts" on public.posts;
drop policy if exists "comments are public" on public.comments;
drop policy if exists "users create own comments" on public.comments;

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
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email,''),'@',1)))
  on conflict (id) do update set username = excluded.username;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.motorcycles (slug,brand,model,year,engine_cc,power_hp,motorcycle_type) values
('yamaha-mt07','Yamaha','MT-07',2025,689,73,'Naked'),
('honda-cbr650r','Honda','CBR650R',2025,649,95,'Sport'),
('bmw-r1300gs','BMW','R 1300 GS',2025,1300,145,'Adventure'),
('kawasaki-z900','Kawasaki','Z900',2025,948,125,'Naked'),
('ducati-monster','Ducati','Monster',2025,937,111,'Naked'),
('ktm-890-adventure','KTM','890 Adventure',2024,889,105,'Adventure')
on conflict (slug) do update set brand=excluded.brand, model=excluded.model, year=excluded.year, engine_cc=excluded.engine_cc, power_hp=excluded.power_hp, motorcycle_type=excluded.motorcycle_type;