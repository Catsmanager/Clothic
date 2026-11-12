# Clothic frontend

이 디렉터리가 Expo 앱 루트다. 작업 전 저장소 루트 [plan.md](../plan.md)를 읽는다.

```bash
npm ci
npm start
npm run check
```

앱 설정·EAS 설정·패키지·잠금 파일·환경변수는 이 디렉터리에 둔다. `EXPO_PUBLIC_CLOTHIC_API_URL`을 설정하면 내 옷 목록만 Spring Boot 서버의 `GET /api/items`로 조회하고, 비워 두면 기존 Supabase 직접 조회를 유지한다(`lib/itemsApi.ts`, `stores/itemStore.ts`). 서버 오류 시 직접 조회로 자동 우회하지 않는다. `eas build`, `eas submit`도 여기서 실행한다. 앱 내부의 `assets/...`와 `@/...` 경로는 기존 앱 루트를 유지한다. Supabase 연결 코드는 [lib/supabase.ts](lib/supabase.ts), 기존 SQL과 Edge Function은 루트 [supabase/](../supabase/)에 있다.

`npm run format:check`는 루트의 공통 Prettier 설정과 제외 목록을 사용해 저장소를 검사한다. 서버 빌드 결과와 로컬 백업은 제외한다. 실행·배포 상세는 [운영 가이드](../docs/operations/CICD.md)를 참고한다.

실제 연결 회귀 검사는 `node --import tsx scripts/verify-live-items.mjs --credentials <로컬-검증계정-파일> --api-url http://127.0.0.1:18080 --allow-test-writes true --report <결과-파일>`로 실행한다. 서버는 [로컬 실행 방법](../backend/README.md)에 따라 준비하고 브라우저 개발 출처도 명시한다. 검증 계정 파일은 `projectUrl`, `anonKey`, `runId`(`f05-`와 12자리 소문자 16진수), `users` 두 개(`id`, `email`, `password`)를 포함하며 Git에 넣지 않는다. 각 계정은 `clothic-<runId>-a@example.invalid`, `clothic-<runId>-b@example.invalid` 주소와 같은 값의 `user_metadata.clothicVerificationRun` 표식이 있어야 한다. 이 표식을 실제 로그인 응답으로 확인한 뒤 해당 임시 계정의 옷만 비우고 검사 데이터를 추가한다.

검사는 실제 Supabase 로그인·기존 조회·서버 조회와 실제 store 코드를 사용한다. 늦은 응답은 수신 지연으로, HTTP 500은 로컬 검사 서버로 주입한다. 네이티브 화면·실기기 렌더링 검증은 포함하지 않으며, 종료 후 준비한 임시 계정과 데이터 정리는 별도로 확인한다.
