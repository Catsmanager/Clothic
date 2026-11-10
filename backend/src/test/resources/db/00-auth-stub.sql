-- 테스트 전용: Supabase가 제공하는 auth 스키마·역할의 최소 대체물.
-- 운영 Supabase에는 적용하지 않는다. 저장소 migration이 참조하는 객체만 만든다.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text
);

-- Supabase auth.uid(): 요청 JWT의 sub. 일반 JDBC 연결에는 설정되지 않아 null을 돌려준다.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- 백엔드 전용 읽기 역할. 테이블 소유자가 아니므로 RLS가 적용된다.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'clothic_backend') then
    create role clothic_backend login password 'clothic_backend_test';
  end if;
end
$$;

-- RLS 동작 관찰용 역할. bypassrls가 없어 정책이 그대로 적용된다.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'clothic_rls_probe') then
    create role clothic_rls_probe login password 'clothic_rls_probe_test';
  end if;
end
$$;

-- 백엔드 역할은 서버가 user_id 조건을 강제하는 대신 RLS를 우회한다(JDBC 연결에는 auth.uid()가 없다).
alter role clothic_backend bypassrls;

-- 운영 DB에는 migration 이전부터 profiles가 있었다. 저장소 migration은 빈 DB에서 순서대로 적용되지 않으므로
-- (20260612000200이 profiles 생성 전에 alter) 당시 상태를 최소로 재현한다. 나머지 열은 migration 3이 추가한다.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade
);
