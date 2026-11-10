# Clothic

패션 습관 분석 기반 모바일 코디 다이어리 앱

사용자는 픽셀 아바타를 활용해 코디를 만들고,
날짜별로 기록하며,
월간 통계를 통해 자신의 패션 습관을 분석할 수 있다.

# 기술스택
- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Supabase (Auth + DB)
- expo-secure-store
- expo-web-browser

## 문서

문서 탐색과 새 문서의 위치는 [docs/README.md](docs/README.md)를 기준으로 한다.

## 기본 원칙
CRITICAL: 작업 시작 시 루트 `plan.md`를 가장 먼저 읽는다. 기능별 실행 상태는 이 파일을 기준으로 하며, 구현·완료 조건 검증 후 해당 항목만 체크한다.
CRITICAL: docs/product/PRD.md의 MVP 범위를 벗어난 기능은 만들지 않는다.
CRITICAL: 구조 변경 전에는 먼저 제안하고 승인받는다.
CRITICAL: API 키는 절대 코드에 하드코딩하지 않는다.
CRITICAL: 앱 환경변수는 frontend/.env.local을 사용한다.
CRITICAL: 파일 변경 작업은 작업별 GitHub 이슈를 연결하고 최소 완료 단위의 원격 작업 브랜치를 생성·확인한 뒤 진행한다. 공통 절차는 `.codex/skills/clothic-task-workflow/SKILL.md`를 따른다.
CRITICAL: 작업 완료 후 커밋·푸시하고 Pull Request를 생성한다. PR의 앱·서버 CI가 통과하고 충돌이 없으면 사용자 확인을 다시 기다리지 않고 main에 병합한다. 사용자가 로컬 작업만 요청했거나 CI가 실패하면 병합하지 않고 그 상태를 보고한다.
CRITICAL: 작업 후 변경 파일 목록을 보고한다.
CRITICAL: 작업 후 검증 결과를 보고한다.
CRITICAL: 작업 진행 요청은 plan.md에서 사용자가 지정한 기능을 우선한다. 별도 지정이 없으면 선행 조건이 충족된 미완료 기능 하나만 처리한다. 과거 TODO 이력의 미완료 표시를 현재 실행 순서로 사용하지 않는다.
CRITICAL: 작업 완료 후 LOG.md를 업데이트한다.
CRITICAL: 옷/신발/하의/상의 에셋 추가 또는 아이템 미리보기 수정 전에는 docs/avatar/ITEM_ASSET_FLOW.md를 먼저 읽고 따른다.

## 작업 방식
모든 작업은 HARNESS 워크플로우를 따른다. 아래 파일이 자동 임포트된다.

@.codex/skills/clothic-task-workflow/SKILL.md
@HARNESS/router.md
@HARNESS/context.md
@HARNESS/loop.md
@HARNESS/roles.md

추가 규칙:
- 작은 단위로 수정한다.
- 작업 완료 후 plan.md의 해당 기능 체크와 검증 근거를 갱신한다. TODO.md는 실행 목록을 중복하지 않고 plan.md로 연결하며, LOG.md에는 날짜가 있는 결과를 남긴다.

## 디렉터리 기준
앱 루트는 `frontend/`, 서버 루트는 `backend/`다. 앱 코드 안의 `assets/...` 같은 상대 경로는 앱 루트 기준을 유지한다. 공통 문서·스킬·계획·Supabase 이력은 저장소 루트에 둔다.

## 검증 명령어
완료 선언 전 아래를 실행하고 결과를 보고한다.
- `npm --prefix frontend run check` (typecheck, lint, format, avatar, core logic, user-flow proxy)
- 의존성·Expo 환경을 변경한 경우 `npm --prefix frontend run verify:environment`

서버 변경 시 `backend/`에서 `./mvnw --batch-mode verify`를 실행한다.

문서만 변경한 경우 생략할 수 있다. 이때 "코드 변경 없음"을 명시한다.

# 절대규칙
- TypeScript strict mode 사용
- any 사용 금지
- type import 사용
- 함수형 컴포넌트만 사용
- Zustand 사용
- Supabase 사용 (AsyncStorage 사용 금지)
- Context API 사용 금지
- MVP 범위 밖 기능 구현 금지


# 금지사항
- 요청하지 않은 기능 추가 금지
- 전체 구조 임의 변경 금지
- 불필요한 리팩토링 금지
- 테스트 없이 완료 선언 금지
- 모르는 내용을 아는 척하지 말 것
- 결제 기능 구현 금지
