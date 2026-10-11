create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  garage_motorcycle_id uuid not null references public.garage_motorcycles(id) on delete cascade,
  service_type text not null check (service_type in ('Przegląd', 'Olej', 'Silnik', 'Napęd', 'Hamulce', 'Opony', 'Inne')),
  title text not null check (char_length(title) between 2 and 120),
  service_date date not null,
  mileage integer check (mileage is null or mileage >= 0),
  cost numeric(10, 2) check (cost is null or cost >= 0),
  next_due_date date,
  next_due_mileage integer check (next_due_mileage is null or next_due_mileage >= 0),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists service_records_garage_date_idx
  on public.service_records (garage_motorcycle_id, service_date desc);

alter table public.service_records enable row level security;

drop policy if exists "users manage own service records" on public.service_records;
create policy "users manage own service records"
  on public.service_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, delete on public.service_records to authenticated;