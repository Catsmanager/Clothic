# LOG

## 2026-05-31

### authStore (Zustand) 구현 (Phase 2)
- stores/authStore.ts 신규 — Supabase Auth 기반 Zustand store
  - 상태: session / user / initialized(세션 복원 완료 플래그)
  - initialize(): supabase.auth.getSession()으로 SecureStore 세션 복원 + onAuthStateChange 구독
  - signUpWithEmail / signInWithEmail / signOut — { error: string | null } 반환(화면 메시지용)
  - type import(Session, User) 사용, any 미사용, strict 통과
- 범위 한정: TODO 규칙대로 "authStore" 항목만 처리.
  로그인/회원가입 화면·인증 가드·카카오 OAuth는 다음 항목으로 남김.

### 검증
- npx tsc --noEmit → 에러 없음
- npx eslint stores/authStore.ts → 통과
- npx prettier --check stores/authStore.ts → 정합

## 2026-05-30

### 문서 정비
- docs/ASSET_PLAN.md 신규 생성
- docs/DATA_MODEL.md 신규 생성
- docs/DESIGN_SYSTEM.md 신규 생성
- docs/PRD.md — 인증·Supabase MVP 범위 반영
- docs/ARCHITECTURE.md — Supabase 스택 전면 보강
- docs/ADR.md — ADR-002 (Supabase) 추가
- docs/TEST_PLAN.md — 인증·RLS 검증 항목 추가
- CLAUDE.md — 기술스택 Supabase 반영
- TODO.md — Phase 0~5 체크리스트 작성

### 프로젝트 초기화 및 홈 화면 구현
- Expo 56 + TypeScript + Expo Router 프로젝트 초기화
- 패키지: expo-router, react-native-safe-area-context, react-native-screens, zustand, @expo/vector-icons
- constants/colors.ts, constants/spacing.ts 생성
- app/_layout.tsx (root layout)
- app/(tabs)/_layout.tsx (탭 바: 홈, 캘린더, +, 통계, 더보기)
- app/(tabs)/index.tsx (홈 화면)
- components/HomeHeader.tsx
- components/DateWeatherBar.tsx
- components/AvatarCard.tsx (placeholder — 에셋 미제작)
- components/MoodMemoCard.tsx
- TypeScript strict mode 통과, 번들 빌드 성공

### 검증
- npx tsc --noEmit → 에러 없음
- Metro 번들 빌드 → 에러 없음

### 다음 단계
- 픽셀 에셋 제작 (ASSET_PLAN.md 참조)
- 코디 만들기 화면 구현

### 잠자는 옷장 화면 구현
- app/(tabs)/more.tsx — 잠자는 옷장 화면 전체 구현
  - 정보 배너 (잠자는 옷 총 개수 표시)
  - 카테고리 필터 탭 (전체·상의·하의·원피스·아우터·신발/가방)
  - 정렬 토글 (오래된 순 ↔ 최신 순)
  - 아이템 리스트 (썸네일·이름·태그·마지막 착용일)
  - 하단 코디 추천 배너
- app/(tabs)/_layout.tsx — '더보기' 탭을 '옷장'으로 변경 (archive-outline 아이콘)

### TODO 재점검 및 정정
- 실제 파일과 TODO.md 대조 → 체크 상태 정정, "현황 메모" 추가
- 확인: 화면 7종은 mock 데이터로 선구현, Supabase/인증/Zustand store는 미구현
- ⚠️ 규칙 위반 발견: app/_layout.tsx·onboarding.tsx의 AsyncStorage 사용
  (CLAUDE.md "AsyncStorage 금지"와 충돌 — Phase 2에서 정리 예정)

### Supabase 클라이언트 기반 구축 (Phase 1)
- 패키지 설치: @supabase/supabase-js ^2.106.2, expo-secure-store ~56.0.4, expo-web-browser ~56.0.5
- lib/supabase.ts 신규 — createClient + expo-secure-store 세션 어댑터
  (AsyncStorage 미사용, web은 Platform 가드, detectSessionInUrl:false)
- lib/database.types.ts 신규 — DATA_MODEL.md 기준 profiles/items/outfits 타입
- types/env.d.ts 신규 — EXPO_PUBLIC_* 환경변수 타입 선언 (@types/node 미도입)
- .env.local / .env.example 신규 — Supabase URL/anon key placeholder (실제 키는 사용자 입력)
- .gitignore 신규 — .env.local 커밋 제외

### 검증
- npx tsc --noEmit → 에러 없음

### 다음 단계
- 사용자: Supabase 프로젝트 생성 후 .env.local에 URL/anon key 입력
- Phase 2: authStore(Zustand) + 로그인/회원가입 화면, AsyncStorage → Supabase/SecureStore 정리

### ESLint / Prettier 설정 (Phase 1)
- devDeps: eslint ^9.39.4, eslint-config-expo ^56.0.4, prettier ^3.8.3, eslint-config-prettier ^10.1.8
- eslint.config.js 신규 — Expo flat config + prettier 충돌 규칙 비활성화
- .prettierrc 신규 — 기존 코드 스타일 반영(semi:false, singleQuote, trailingComma:es5, printWidth:100)
- .prettierignore 신규 — 코드만 대상(node_modules/assets/문서 제외)
- package.json scripts: lint / format / format:check 추가
- 신규 파일(lib·types·config) 모두 lint·prettier 통과

### 검증
- npx eslint . → 설정 정상 동작 (기존 코드에 1 error + 8 warning 검출, 이번 범위 밖이라 미수정)
- npx prettier --check → 코드만 검사(12개 기존 파일 미포맷, 별도 작업)
- npx tsc --noEmit → 에러 없음

### 알려진 후속 작업
- `npm run format` 으로 기존 코드 12파일 일괄 포매팅 (원할 때)
- components/DonutChart.tsx — react 렌더 후 변수 재할당 ESLint error (Phase 4 정리 시 수정)

### 에셋 구조·메타데이터 준비 (Phase 3 — 코드/구조 부분)
- 한계 명시: 픽셀 아트 PNG는 직접 생성 불가 → 주변 코드/구조만 정비 (사용자 승인)
- assets/avatar/{top,bottom,shoes,bag,accessory}/ 디렉토리 + .gitkeep 생성
- assets/avatar/README.md 신규 — 규격·네이밍·제작 체크리스트(33종 + base)
- constants/items.ts 신규 — 카탈로그 메타데이터 33종 (top10/bottom8/shoes6/bag5/accessory4)
  - 타입: Category, StyleTag(DATA_MODEL 기준), CatalogItem
  - imagePath는 문자열 경로(require 아님) → PNG 미제작 상태에서도 빌드 안전
  - RENDER_ORDER, CATEGORY_LABELS, getItemsByCategory/getItemById 헬퍼
- 미완료(불가): 상의/하의/신발/가방/액세서리 PNG 실제 제작 — 디자이너/이미지 툴 영역

### 검증
- 카테고리 카운트 10/8/6/5/4 = 33 확인
- npx tsc --noEmit → 에러 없음 / npx eslint constants/items.ts → 통과 / prettier 정합

### 발견한 충돌 (사용자 결정 필요)
- 문서(PRD/ASSET_PLAN/DATA_MODEL)에는 'hair' 카테고리 없음 →
  items.ts는 문서 기준 5종으로 작성
- 그러나 기존 UI(constants/mockItems.ts, app/(tabs)/create.tsx)에는 'hair' 존재
- 선택지: (A) 문서에 hair 추가 후 에셋 계획 확장 / (B) UI에서 hair 제거
- 현재 mockItems.ts는 UI가 사용 중이라 그대로 두고 병존 — Phase 4 수렴 시 정리
