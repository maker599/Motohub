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
create policy "community reactions are public"
  on public.post_reactions for select using (true);
create policy "users manage own community reactions"
  on public.post_reactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.posts to authenticated;
grant select on public.posts to anon;
grant select, insert, update, delete on public.comments to authenticated;
grant select on public.comments to anon;
grant select on public.post_reactions to anon, authenticated;
grant insert, update, delete on public.post_reactions to authenticated;

drop policy if exists "users manage own posts" on public.posts;
drop policy if exists "users manage own comments" on public.comments;
create policy "users manage own posts"
  on public.posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "users manage own comments"
  on public.comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-attachments',
  'community-attachments',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "community attachments are public" on storage.objects;
drop policy if exists "users upload own community attachments" on storage.objects;
drop policy if exists "users delete own community attachments" on storage.objects;
create policy "community attachments are public"
  on storage.objects for select
  using (bucket_id = 'community-attachments');
create policy "users upload own community attachments"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'community-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own community attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'community-attachments' and (storage.foldername(name))[1] = auth.uid()::text);