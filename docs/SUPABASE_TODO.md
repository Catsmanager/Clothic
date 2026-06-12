# Supabase 작업 체크리스트

Clothic 앱 코드 기준으로 Supabase에서 확인하거나 설정해야 할 항목입니다.
이미 완료한 항목은 체크만 하고 넘어가면 됩니다.

## 1. 프로젝트 키 확인

- [ ] Supabase Dashboard → Project Settings → API에서 Project URL 확인
- [ ] Supabase Dashboard → Project Settings → API에서 anon public key 확인
- [ ] 로컬 `.env.local`에 아래 값이 들어있는지 확인

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

## 2. DB 스키마 생성/확인

Supabase Dashboard → SQL Editor에서 실행합니다.

```sql
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text,
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  category text not null,
  image_path text not null default '',
  color text not null,
  style_tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  mood text,
  weather text,
  memo text,
  item_ids text[] default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz default now()
);
```

## 3. 기존 테이블 마이그레이션

기존 `outfits` 테이블이 이미 있다면 반드시 확인합니다.

```sql
alter table outfits
  add column if not exists is_favorite boolean not null default false;

alter table outfits
  alter column item_ids type text[] using item_ids::text[];
```

`item_ids`는 `top_002`, `bottom_010` 같은 카탈로그 문자열 ID를 저장하므로 `uuid[]`가 아니라 `text[]`여야 합니다.

과거에 `bag` 카테고리 사용자 아이템을 저장한 적이 있다면 아래도 실행합니다.

```sql
update items
set category = 'accessory'
where category = 'bag';
```

## 4. RLS 활성화 및 정책 확인

Supabase Dashboard → Authentication을 사용하는 사용자별 데이터이므로 RLS가 필요합니다.

```sql
alter table profiles enable row level security;
alter table items enable row level security;
alter table outfits enable row level security;

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
```

## 5. Auth 설정

- [ ] Authentication → Providers → Email 활성화 확인
- [ ] 개발 중이면 Email confirmation을 끄거나, 테스트 이메일 인증 플로우를 준비
- [ ] Authentication → URL Configuration → Site URL 확인
- [ ] Redirect URLs에 아래 딥링크 추가

```text
clothic://auth/callback
```

## 6. Kakao OAuth 설정

Supabase Dashboard → Authentication → Providers → Kakao:

- [ ] Enable ON
- [ ] Kakao Client ID = 카카오 REST API 키
- [ ] Kakao Client Secret = 카카오 Client Secret
- [ ] Kakao Developers Redirect URI에 아래 값 등록

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

참고 문서: `docs/KAKAO_OAUTH.md`

## 7. Apple 로그인 설정

Supabase Dashboard → Authentication → Providers → Apple:

- [ ] Enable ON
- [ ] Service ID 또는 Client ID 설정
- [ ] Team ID 설정
- [ ] Key ID 설정
- [ ] `.p8` private key 입력
- [ ] 허용 client id에 iOS bundle id 포함: `com.clothic.app`

Apple Developer에서도 `com.clothic.app` App ID의 Sign in with Apple capability를 켜야 합니다.

참고 문서: `docs/APPLE_SIGNIN.md`

## 8. 계정 삭제 Edge Function 배포

앱의 계정 삭제 기능은 `delete-account` Edge Function을 호출합니다.

```bash
supabase functions deploy delete-account
```

Supabase Edge Function 런타임에서 아래 값은 기본 제공됩니다.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

참고 문서: `supabase/functions/delete-account/README.md`

## 9. 최종 검증

- [ ] 이메일 회원가입/로그인 성공
- [ ] 카카오 로그인 후 앱으로 복귀하고 홈 화면 진입
- [ ] iOS dev/prod build에서 Apple 로그인 성공
- [ ] 코디 저장 성공: `outfits.item_ids`에 문자열 ID 배열 저장
- [ ] 저장한 코디 목록/상세 조회 성공
- [ ] 즐겨찾기 토글 성공: `outfits.is_favorite` 업데이트
- [ ] 아이템 등록 성공: `items` insert
- [ ] 다른 계정 데이터가 보이지 않음 (RLS 확인)
- [ ] 계정 삭제 성공: `profiles`, `items`, `outfits`, `auth.users` 삭제

