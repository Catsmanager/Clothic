-- 이메일 계정과 갱신 토큰 (plan.md S-02).

-- 이메일은 앞뒤 공백을 지우고 소문자로 바꾼 값만 저장한다. 서버가 저장 전에 정규화하고 DB가 한 번 더 확인한다.
-- 두 열 모두 비어 있을 수 있다. 이후 소셜 로그인만 쓰는 계정에는 비밀번호가 없다.
alter table users
  add column email text,
  add column password_hash text,
  add constraint users_email_normalized check (email = lower(btrim(email)) and email <> '');

create unique index users_email_unique_idx on users (email) where email is not null;

-- 갱신 토큰은 원문을 저장하지 않고 SHA-256 해시만 둔다.
-- family_id는 한 번의 로그인(또는 가입)에서 이어진 토큰 묶음이다. 폐기된 토큰이 다시 쓰이면 묶음 전체를 폐기한다.
create table refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  family_id uuid not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index refresh_tokens_family_idx on refresh_tokens (family_id);
create index refresh_tokens_user_idx on refresh_tokens (user_id);
