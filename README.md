# Clothic

Expo 앱과 Spring Boot 마이그레이션 서버를 한 저장소에서 관리한다. 작업 전 [plan.md](plan.md)를 먼저 확인한다.

```text
frontend/   Expo·React Native 앱, 앱 설정·테스트·에셋
backend/    Java 21·Spring Boot 서버, Maven·서버 테스트
supabase/   기존 데이터베이스 마이그레이션·Edge Function
docs/      설계·기능·운영·학습 문서
HARNESS/    공통 검증 규칙·fixture·평가기준
.github/    공통 CI·앱 릴리스 workflow
.codex/     저장소 스킬
plan.md     기능별 작업·완료 상태
```

## 앱 실행

```bash
cd frontend
npm ci
npm start
```

앱 환경변수는 `frontend/.env.example`을 참고해 `frontend/.env.local`에 설정한다. 기존 앱은 계속 Supabase Auth·데이터베이스를 사용한다.

## 서버 실행

```bash
cd backend
./mvnw spring-boot:run
```

현재 `GET /api/health`만 제공한다. 인증·데이터베이스·앱 연결은 후속 작업이다. 자세한 실행 방법은 [서버 안내](backend/README.md)를 참고한다.

## 검증

루트에서 앱은 `npm --prefix frontend run check`, 서버는 `backend/`에서 `./mvnw --batch-mode verify`로 확인한다. 전체 문서는 [docs/README.md](docs/README.md), 브랜치·버전·배포는 [운영 가이드](docs/operations/CICD.md)를 따른다.
