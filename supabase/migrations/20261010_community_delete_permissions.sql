drop policy if exists "users manage own posts" on public.posts;
create policy "users manage own posts"
  on public.posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users manage own comments" on public.comments;
create policy "users manage own comments"
  on public.comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;