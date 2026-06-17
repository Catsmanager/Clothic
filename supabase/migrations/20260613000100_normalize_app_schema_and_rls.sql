create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text,
  daily_reminder_enabled boolean not null default true,
  sleeping_wardrobe_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles
  add column if not exists username text,
  add column if not exists daily_reminder_enabled boolean not null default true,
  add column if not exists sleeping_wardrobe_enabled boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null,
  image_path text not null default '',
  color text not null,
  style_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table items
  add column if not exists image_path text not null default '',
  add column if not exists style_tags text[] not null default '{}',
  alter column style_tags set default '{}',
  alter column image_path set default '';

create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  mood text,
  weather text,
  memo text,
  item_ids text[] not null default '{}',
  item_colors jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table outfits
  add column if not exists item_ids text[] not null default '{}',
  add column if not exists item_colors jsonb not null default '{}'::jsonb,
  add column if not exists is_favorite boolean not null default false,
  alter column item_ids type text[] using coalesce(item_ids::text[], '{}'),
  alter column item_ids set default '{}',
  alter column item_colors set default '{}'::jsonb,
  alter column is_favorite set default false;

update outfits
set
  item_ids = coalesce(item_ids, '{}'),
  item_colors = coalesce(item_colors, '{}'::jsonb),
  is_favorite = coalesce(is_favorite, false);

alter table outfits
  alter column item_ids set not null,
  alter column item_colors set not null,
  alter column is_favorite set not null;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  icon text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists items_user_created_at_idx
  on items (user_id, created_at desc);

create index if not exists outfits_user_date_idx
  on outfits (user_id, date desc);

create index if not exists notifications_user_created_at_idx
  on notifications (user_id, created_at desc);

alter table profiles enable row level security;
alter table items enable row level security;
alter table outfits enable row level security;
alter table notifications enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "own items" on items;
create policy "own items" on items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own outfits" on outfits;
create policy "own outfits" on outfits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own notifications" on notifications;
create policy "own notifications" on notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;
