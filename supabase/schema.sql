create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, username text unique not null, created_at timestamptz not null default now());
create table if not exists public.motorcycles (id uuid primary key default gen_random_uuid(), slug text unique not null, brand text not null, model text not null, year integer not null, engine_cc integer, power_hp integer, motorcycle_type text, image_url text, created_at timestamptz not null default now());
create table if not exists public.garage_motorcycles (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, motorcycle_id uuid not null references public.motorcycles(id) on delete cascade, nickname text, mileage integer, notes text, created_at timestamptz not null default now(), unique(user_id, motorcycle_id));
create table if not exists public.posts (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, content text not null check (char_length(content) between 1 and 2000), created_at timestamptz not null default now());
create table if not exists public.comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, content text not null check (char_length(content) between 1 and 1000), created_at timestamptz not null default now());
create table if not exists public.saved_setups (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, name text not null check (char_length(name) between 1 and 100), engine text not null check (engine in ('Minarelli AM6', 'Derbi D50B0', 'Derbi D50B1')), goal text not null check (goal in ('daily', 'sport', 'race', 'track')), setup jsonb not null check (jsonb_typeof(setup) = 'object'), created_at timestamptz not null default now());
alter table public.saved_setups add column if not exists share_token uuid unique;
create index if not exists saved_setups_user_created_idx on public.saved_setups (user_id, created_at desc);
create table if not exists public.service_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, garage_motorcycle_id uuid not null references public.garage_motorcycles(id) on delete cascade, service_type text not null check (service_type in ('Przegląd', 'Olej', 'Silnik', 'Napęd', 'Hamulce', 'Opony', 'Inne')), title text not null check (char_length(title) between 2 and 120), service_date date not null, mileage integer check (mileage is null or mileage >= 0), cost numeric(10, 2) check (cost is null or cost >= 0), next_due_date date, next_due_mileage integer check (next_due_mileage is null or next_due_mileage >= 0), notes text check (notes is null or char_length(notes) <= 1000), created_at timestamptz not null default now());
create index if not exists service_records_garage_date_idx on public.service_records (garage_motorcycle_id, service_date desc);
create table if not exists public.shopping_lists (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, name text not null check (char_length(name) between 1 and 100), items jsonb not null check (jsonb_typeof(items) = 'array'), exchange_rate numeric(10, 4) not null default 4.3775 check (exchange_rate > 0), shipping_by_store jsonb not null default '{}'::jsonb check (jsonb_typeof(shipping_by_store) = 'object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists shopping_lists_user_updated_idx on public.shopping_lists (user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.garage_motorcycles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.saved_setups enable row level security;
alter table public.service_records enable row level security;
alter table public.shopping_lists enable row level security;

drop policy if exists "profiles are public" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "motorcycles are public" on public.motorcycles;
drop policy if exists "users manage own garage" on public.garage_motorcycles;
drop policy if exists "posts are public" on public.posts;
drop policy if exists "users create own posts" on public.posts;
drop policy if exists "users manage own posts" on public.posts;
drop policy if exists "comments are public" on public.comments;
drop policy if exists "users create own comments" on public.comments;
drop policy if exists "users manage own saved setups" on public.saved_setups;
drop policy if exists "users manage own service records" on public.service_records;
drop policy if exists "users manage own shopping lists" on public.shopping_lists;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "motorcycles are public" on public.motorcycles for select using (true);
create policy "users manage own garage" on public.garage_motorcycles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts are public" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "users manage own posts" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "users manage own comments" on public.comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own saved setups" on public.saved_setups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own service records" on public.service_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own shopping lists" on public.shopping_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, update, delete on public.saved_setups to authenticated;
grant select, insert, update, delete on public.service_records to authenticated;
grant select, insert, update, delete on public.shopping_lists to authenticated;

create or replace function public.get_shared_setup(p_token uuid)
returns jsonb language sql security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object('name', setup.name, 'engine', setup.engine, 'goal', setup.goal, 'setup', setup.setup, 'created_at', setup.created_at)
  from public.saved_setups as setup
  where setup.share_token = p_token
  limit 1;
$$;
revoke all on function public.get_shared_setup(uuid) from public;
grant execute on function public.get_shared_setup(uuid) to anon, authenticated;

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

alter table public.posts
  add column if not exists post_type text not null default 'post',
  add column if not exists title text,
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists shared_setup_token uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_post_type_check') then
    alter table public.posts add constraint posts_post_type_check check (post_type in ('post', 'thread'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_title_check') then
    alter table public.posts add constraint posts_title_check check (title is null or char_length(title) between 2 and 120);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_thread_title_check') then
    alter table public.posts add constraint posts_thread_title_check check (post_type <> 'thread' or title is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_attachments_array_check') then
    alter table public.posts add constraint posts_attachments_array_check check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 5);
  end if;
end;
$$;

create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'wrench', 'fire')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists post_reactions_post_idx on public.post_reactions (post_id);
create index if not exists posts_feed_idx on public.posts (created_at desc);

alter table public.post_reactions enable row level security;
drop policy if exists "community reactions are public" on public.post_reactions;
drop policy if exists "users manage own community reactions" on public.post_reactions;
create policy "community reactions are public" on public.post_reactions for select using (true);
create policy "users manage own community reactions" on public.post_reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert on public.posts to authenticated;
grant select on public.posts to anon;
grant select, insert on public.comments to authenticated;
grant select on public.comments to anon;
grant select on public.post_reactions to anon, authenticated;
grant insert, update, delete on public.post_reactions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-attachments', 'community-attachments', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "community attachments are public" on storage.objects;
drop policy if exists "users upload own community attachments" on storage.objects;
drop policy if exists "users delete own community attachments" on storage.objects;
create policy "community attachments are public" on storage.objects for select using (bucket_id = 'community-attachments');
create policy "users upload own community attachments" on storage.objects for insert to authenticated with check (bucket_id = 'community-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own community attachments" on storage.objects for delete to authenticated using (bucket_id = 'community-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
