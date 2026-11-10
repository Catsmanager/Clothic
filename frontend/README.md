# Clothic frontend

이 디렉터리가 Expo 앱 루트다. 작업 전 저장소 루트 [plan.md](../plan.md)를 읽는다.

```bash
npm ci
npm start
npm run check
```

앱 설정·EAS 설정·패키지·잠금 파일·환경변수는 이 디렉터리에 둔다. `EXPO_PUBLIC_CLOTHIC_API_URL`을 설정하면 내 옷 목록만 Spring Boot 서버의 `GET /api/items`로 조회하고, 비워 두면 기존 Supabase 직접 조회를 유지한다(`lib/itemsApi.ts`, `stores/itemStore.ts`). 서버 오류 시 직접 조회로 자동 우회하지 않는다. `eas build`, `eas submit`도 여기서 실행한다. 앱 내부의 `assets/...`와 `@/...` 경로는 기존 앱 루트를 유지한다. Supabase 연결 코드는 [lib/supabase.ts](lib/supabase.ts), 기존 SQL과 Edge Function은 루트 [supabase/](../supabase/)에 있다.

`npm run format:check`는 루트의 공통 Prettier 설정과 제외 목록을 사용해 저장소를 검사한다. 서버 빌드 결과와 로컬 백업은 제외한다. 실행·배포 상세는 [운영 가이드](../docs/operations/CICD.md)를 참고한다.
