# delete-account Edge Function

로그인 사용자의 계정과 모든 데이터(outfits, items, profiles, auth user)를 영구 삭제한다.
App Store Guideline 5.1.1(v)의 "앱 내 계정 삭제" 요건을 충족하기 위한 서버 함수.

## 동작

1. 요청의 `Authorization: Bearer <jwt>`로 호출자를 식별·검증
2. `service_role`로 해당 사용자의 `outfits` / `items` / `profiles` 행 삭제
3. `auth.admin.deleteUser(uid)`로 인증 계정 삭제

## 배포 (사용자 작업)

```bash
# Supabase CLI 로그인 및 프로젝트 연결이 되어 있어야 함
supabase functions deploy delete-account
```

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는
  Supabase가 Edge Function 런타임에 **기본 주입**하므로 별도 시크릿 설정이 필요 없다.

## 클라이언트 호출

`stores/authStore.ts`의 `deleteAccount()`가
`supabase.functions.invoke('delete-account')`로 호출한다.
함수 미배포 상태에서는 호출이 실패하며, 앱은 에러 메시지를 표시한다.
