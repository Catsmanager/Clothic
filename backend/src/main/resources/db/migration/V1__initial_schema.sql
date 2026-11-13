-- Clothic 서버가 직접 소유하는 초기 스키마 (plan.md S-01, ADR-004).
-- Supabase의 auth.users·auth.uid()·RLS에 의존하지 않는다. 사용자 격리는 서버의 user_id 조건이 담당한다.
-- 테이블·열 이름과 형식은 전환 전 스키마와 같게 유지해 서버의 SQL이 두 DB에서 똑같이 동작한다.
-- 적용된 뒤에는 이 파일을 고치지 않는다. 변경은 V2 이후의 새 파일로 추가한다.

-- 계정. 로그인에 필요한 열(이메일·비밀번호 해시 등)은 S-02에서 추가한다.
create table users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references users on delete cascade,
  username text,
  daily_reminder_enabled boolean not null default true,
  sleeping_wardrobe_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  catalog_item_id text,
  name text not null,
  category text not null,
  image_path text not null default '',
  color text not null,
  style_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index items_user_created_at_idx on items (user_id, created_at desc);
create index items_user_category_idx on items (user_id, category);
-- 같은 사용자가 같은 기본 옷을 두 번 등록하지 못하게 한다.
create unique index items_user_catalog_item_unique_idx
  on items (user_id, catalog_item_id)
  where catalog_item_id is not null;

create table outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  date date not null,
  mood text,
  weather text,
  memo text,
  item_ids text[] not null default '{}',
  item_colors jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index outfits_user_date_idx on outfits (user_id, date desc);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  type text not null,
  icon text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_created_at_idx on notifications (user_id, created_at desc);

-- 계정이 생기면 프로필 행을 함께 만든다. 서버의 프로필 API는 행을 만들지 않고 없으면 404를 돌려주는 계약이다.
create function create_profile_for_new_user()
returns trigger
language plpgsql
as $$
begin
  insert into profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger users_create_profile
  after insert on users
  for each row execute function create_profile_for_new_user();
