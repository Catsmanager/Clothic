create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null,
  icon text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "own notifications" on notifications;
create policy "own notifications" on notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
