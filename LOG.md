# LOG

## 2026-06-01 (인증 화면 공통 UI 분리)

### 처리 항목
- GitHub Issue: #24 Refactor shared auth screen components
- 작업 브랜치: feature/refactor-auth-screens

### 신규/변경
- components/auth/AuthScreen.tsx 신규
  - SafeAreaView, KeyboardAvoidingView, 중앙 content, footer 배치 공통화
- components/auth/AuthHeader.tsx 신규
  - 인증 화면 제목/설명 typography 공통화
- components/auth/AuthTextField.tsx 신규
  - label + TextInput 필드 스타일과 기본 입력 props 공통화
- components/auth/AuthSubmitButton.tsx 신규
  - submit 버튼, disabled opacity, loading indicator 공통화
- components/auth/AuthErrorText.tsx 신규
  - 인증 에러 텍스트 표시 공통화
- components/auth/AuthFooterLink.tsx 신규
  - 로그인/회원가입 전환 footer link 공통화
- components/auth/AuthDivider.tsx 신규
  - 로그인 화면의 "또는" 구분선 컴포넌트 분리
- app/login.tsx 축소
  - 기존 259줄 → 138줄
  - 로그인/카카오 인증 상태와 submit 흐름은 유지하고 반복 UI를 공통 컴포넌트로 교체
- app/signup.tsx 축소
  - 기존 230줄 → 119줄
  - 회원가입 validation/auth 흐름은 유지하고 반복 UI를 공통 컴포넌트로 교체
## 2026-06-01 (공통 날짜 유틸 분리)

### 처리 항목
- GitHub Issue: #20 Refactor shared date utilities
- 작업 브랜치: feature/refactor-shared-date-utils
- 기준: 닫힌 리팩토링 PR #13, #15, #17, #19 확인 후 후속 작업

### 신규/변경
- lib/date.ts 신규
  - YYYY-MM-DD 로컬 날짜 key, 월 key, 요일 라벨, 날짜 표시 포맷 함수 분리
  - `parseDateKey`는 `YYYY-MM-DD`를 로컬 Date로 파싱해 UTC 파싱 시차 문제를 피하도록 구성
- components/DateWeatherBar.tsx
  - 로컬 요일/날짜 포맷 helper 제거 후 공통 유틸 사용
- components/SaveOutfitSheet.tsx
  - 오늘 날짜 생성 로직을 `getTodayDateKey`로 교체
- app/(tabs)/index.tsx
  - 오늘 코디 조회 날짜 key 생성 로직 공통화
- app/(tabs)/calendar.tsx
  - 캘린더 cell key, 요일 헤더, 선택 날짜 표시 로직 공통화
- app/outfits.tsx, app/outfit/[id].tsx
  - 코디 목록/상세 날짜 표시 helper 제거 후 공통 유틸 사용
- lib/monthlyStats.ts
  - 월 key 생성 로직을 `lib/date.ts`로 이동

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS
- git diff --check → PASS

## 2026-05-31 (월간 통계 화면 책임 분리)

### 처리 항목
- GitHub Issue: #18 Refactor monthly stats screen responsibilities
- 작업 브랜치: feature/refactor-monthly-stats

### 신규/변경
- lib/monthlyStats.ts 신규
  - 월 key 생성, 월간 리포트 데이터 계산, 아이템/색상/스타일 집계 분리
- hooks/useMonthNavigation.ts 신규
  - 연/월 상태와 이전/다음 월 이동 로직 분리
- components/monthly-stats/StatsHeader.tsx 신규
- components/monthly-stats/MonthNavigator.tsx 신규
- components/monthly-stats/StatsCard.tsx 신규
- components/monthly-stats/TotalOutfitsCard.tsx 신규
- components/monthly-stats/TopColorsCard.tsx 신규
- components/monthly-stats/TopItemsCard.tsx 신규
- components/monthly-stats/TopStylesCard.tsx 신규
- components/monthly-stats/StatsTipCard.tsx 신규
- components/monthly-stats/EmptyStatsCard.tsx 신규
- app/(tabs)/stats.tsx 축소
  - 기존 466줄 → 79줄
  - 라우트 화면은 outfit fetch, 월 상태, 리포트 계산 결과와 섹션 조립만 담당
## 2026-05-31 (잠자는 옷장 화면 책임 분리)

### 처리 항목
- GitHub Issue: #16 Refactor sleeping wardrobe screen responsibilities
- 작업 브랜치: feature/refactor-sleeping-wardrobe

### 신규/변경
- constants/sleepingWardrobe.ts 신규
  - 잠자는 옷장 mock 데이터, 카테고리 타입, 정렬 타입, 카테고리별 카운트 분리
- hooks/useSleepingWardrobe.ts 신규
  - 선택 카테고리, 정렬 상태, 필터링/정렬된 item 목록, 정렬 토글 담당
- components/sleeping-wardrobe/WardrobeHeader.tsx 신규
- components/sleeping-wardrobe/SleepingSummaryBanner.tsx 신규
- components/sleeping-wardrobe/SleepingCategoryTabs.tsx 신규
- components/sleeping-wardrobe/SleepingToolbar.tsx 신규
- components/sleeping-wardrobe/SleepingItemList.tsx 신규
- components/sleeping-wardrobe/SleepingBottomBanner.tsx 신규
- app/(tabs)/more.tsx 축소
  - 기존 634줄 → 44줄
  - 라우트 화면은 hook 결과와 섹션 컴포넌트 조립만 담당
## 2026-05-31 (온보딩 화면 책임 분리)

### 처리 항목
- GitHub Issue: #14 Refactor onboarding screen responsibilities
- 작업 브랜치: feature/refactor-onboarding-screen

### 신규/변경
- constants/onboarding.ts 신규
  - 6개 온보딩 슬라이드 데이터, 리포트 샘플 데이터, 컨페티 데이터를 화면 파일 밖으로 분리
- hooks/useOnboardingPager.ts 신규
  - FlatList ref, 현재 인덱스, 스크롤 동기화, 다음 슬라이드 이동 로직 분리
- components/onboarding/OnboardingSlideView.tsx 신규
  - welcome/feature/final 슬라이드 텍스트 레이아웃 담당
- components/onboarding/OnboardingControls.tsx 신규
  - 첫 화면/중간 화면/마지막 화면의 하단 버튼·도트 UI 담당
- components/onboarding/OnboardingIllustrations.tsx 신규
  - 6개 슬라이드 일러스트 렌더링 담당
- components/onboarding/layout.ts 신규
  - 온보딩 화면 width/height 상수화
- app/onboarding.tsx 축소
  - 기존 785줄 → 62줄
  - 라우트 화면은 인증 완료 처리, FlatList 조립, 하단 컨트롤 연결만 담당

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS

## 2026-05-31 (코디 생성 화면 책임 분리)

### 처리 항목
- GitHub Issue: #12 Refactor outfit creation screen responsibilities
- 작업 브랜치: feature/refactor-create-screen
- 기준: 이전 카탈로그 리팩토링 브랜치 위에 stacked 작업

### 신규/변경
- hooks/useOutfitEditor.ts 신규
  - active category/subcategory, equipped item state, undo/redo history, filtered items, 저장 itemIds 파생을 담당
- components/outfit-editor/CreateHeader.tsx 신규
- components/outfit-editor/CategoryRail.tsx 신규
- components/outfit-editor/AvatarPreview.tsx 신규
- components/outfit-editor/EditorActionPanel.tsx 신규
- components/outfit-editor/ItemPickerPanel.tsx 신규
- app/(tabs)/create.tsx 축소
  - 기존 461줄 → 87줄
  - 라우트 화면은 저장 시트 상태, 저장 액션, 섹션 조립만 담당

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS

## 2026-05-31 (카탈로그/데이터 흐름 리팩토링)

### 처리 항목
- 사용자 결정: hair는 현재 제품 범위에서 제외하고, 추후 추가 가능하도록 유지
- 사용자 작업 규칙 추가: 모든 작업은 이슈 생성 → 작업 브랜치 → 완료 후 PR 생성 흐름으로 진행

### 신규/변경
- constants/items.ts — 단일 아이템 카탈로그로 정리
  - ITEM_CATEGORIES, SUB_CATEGORIES, isCategory 추가
  - hair는 현재 Category에서 제외, 추후 확장 가능 주석 보강
- constants/mockItems.ts 삭제 — create/item-select가 constants/items.ts를 사용하도록 전환
- app/(tabs)/create.tsx — hair 카테고리 제거, ITEMS 기반 선택 UI로 변경
- app/item-select.tsx — ITEMS 기반 목록 + category 파라미터 런타임 검증 추가
- app/(tabs)/index.tsx — 오늘 저장된 outfit의 mood/memo 표시
- app/(tabs)/calendar.tsx — mock outfits 제거, outfitStore 데이터 기반 날짜 표시/상세 카드로 변경
- app/(tabs)/stats.tsx — mock 월간 리포트 제거, 저장된 outfits/itemIds 기반 클라이언트 통계 계산
- stores/authStore.ts — initialize 중 auth listener 중복 등록 방지, 초기화 예외 시 로딩 고착 방지
- CLAUDE.md / docs/ARCHITECTURE.md / TODO.md — 실제 구조와 작업 규칙 반영

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 대상 변경 파일 → PASS
- git diff --check → PASS

### 남은 리스크
- GitHub CLI 토큰 만료로 이슈/PR 생성은 미완료
  - `gh auth status`: token invalid
  - 필요 조치: `gh auth login -h github.com` 재인증 후 issue/PR 생성
- 잠자는 옷장(app/(tabs)/more.tsx)은 여전히 mock 데이터 기반

## 2026-05-31 (코디 저장 — Phase 4)

### 처리 항목 (TODO 1개): 코디 저장 (mood, weather, memo)
- HARNESS 절차: router(C) → context 선언 → loop(plan·draft·review·revise·report) → roles
- 사용자 결정: 저장 입력을 '저장 바텀시트(모달)'로 받음

### 신규/변경
- stores/outfitStore.ts — addOutfit(NewOutfit) 추가
  - supabase.auth.getUser()로 user_id 확보(미로그인 시 에러 반환), outfits insert + 목록 맨 앞 반영
  - NewOutfit 타입 export
- components/SaveOutfitSheet.tsx (신규) — 저장 바텀시트(Modal)
  - 날씨/기분 칩 선택(토글), 한 줄 메모(50자), 저장/취소, saving 중 로딩·비활성화
  - 날짜는 오늘(YYYY-MM-DD) 자동
- app/(tabs)/create.tsx — '저장' 버튼에 시트 연결
  - 선택 아이템 id 수집 → addOutfit → 성공 시 router.replace('/outfits'), 실패 시 Alert

### 검토(Reviewer)/수정(Reviser)
- 미로그인 사용자: addOutfit에서 '로그인이 필요합니다' 반환 → create에서 Alert 처리
- create.tsx:30 기존 unused CATEGORY_ICONS 경고는 이번 범위 밖이라 미수정(유지)

### 검증
- npm run typecheck → PASS
- npm run lint → PASS (신규 파일 경고 0; 기존 mock 화면 warning만 잔존)
- npm run format:check → PASS
- ⚠️ 미검증(불가): 실제 저장 DB 왕복 — .env.local 실제 키 + is_favorite 컬럼 마이그레이션 필요(사용자)
  + 미로그인 시 저장 불가(설계대로)

### 남은 리스크
- 아이템 PNG 부재로 코디는 색상 placeholder 기반 — item_ids는 저장되나 시각 렌더는 base 아바타
- 저장 후 /outfits 목록에서 확인 가능(이전 PR #7과 연결)

## 2026-05-31 (코디 목록/상세 조회 — Phase 4)

### 처리 항목 (TODO 1개): 코디 목록 / 상세 조회
- HARNESS 절차 준수: router(C 작업) → context 선언 → loop(plan·draft·review·revise) → roles(writer·reviewer·reviser)
- 사용자 결정: ① 코디 목록/상세 조회 처리 ② '코디 저장'은 탭이 아닌 별도 화면 ③ 즐겨찾기(★) 포함

### 신규/변경
- stores/outfitStore.ts (신규) — Zustand. outfits Supabase 연동
  - fetchOutfits(date 내림차순), toggleFavorite(낙관적 업데이트+롤백), removeOutfit
  - DB(snake_case) Row → 앱(camelCase) Outfit 매핑, is_favorite 미존재 DB 방어(?? false)
  - MOOD_LABELS / WEATHER_LABELS (DATA_MODEL Mood/Weather → 한글)
- app/outfits.tsx (신규) — 코디 저장 목록 화면(별도 스택, 탭 아님)
  - 전체 코디 / 즐겨찾기 탭, 3열 그리드 카드(아바타 썸네일·날짜·메모·★ 토글)
  - 빈 상태 / 로딩 / 에러+재시도, 하단 '새 코디 저장하기'(→ create) — 이미지 시안 반영
- app/outfit/[id].tsx (신규) — 코디 상세(아바타 카드·날씨/기분/메모·착용 아이템 칩·★ 토글·삭제)
- app/(tabs)/index.tsx — 홈 하단에 '저장한 코디 보기'(→ /outfits) 버튼 추가
- lib/database.types.ts — outfits에 is_favorite 추가 + 각 테이블 Relationships:[] 보강
  (supabase-js 2.106 update/delete가 never로 추론되던 타입 이슈 해소)
- docs/DATA_MODEL.md — Outfit.isFavorite + outfits.is_favorite 컬럼 + 마이그레이션 SQL 명시

### 검토(Reviewer)와 수정(Reviser)
- 이미지 우상단 '편집'·카드 '⋮' 메뉴: 별도 편집 기능이라 '조회' 범위에서 제외(의도적 축소)
- 상세 화면 삭제: '조회' 범위를 넘으나 이미지 ⋮ 메뉴가 암시하고 코디 관리에 필요해 유지(리스크로 보고)

### 검증
- npm run typecheck → PASS
- npm run lint → PASS (신규 파일 경고 0, 기존 mock 화면 warning 2건은 비차단)
- npm run format:check → PASS
- ⚠️ 미검증(불가): 실제 화면 렌더링·Supabase 왕복. 사유:
  (1) '코디 저장' 미구현이라 outfits 테이블이 비어 목록은 빈 상태로 보임
  (2) is_favorite 컬럼 마이그레이션은 사용자가 Supabase에서 실행해야 동작(DATA_MODEL.md SQL)
  (3) 아바타 썸네일 PNG 부재 → 카드/상세는 base 아바타로 표시

### 남은 리스크
- 코디 저장(다음 TODO) 완료 전에는 목록에 표시할 실데이터가 없음
- is_favorite 마이그레이션 전 즐겨찾기 토글은 DB 오류 가능(코드는 롤백 처리)

## 2026-05-31 (CI/CD 구축)

### 범위: CI 검증 + EAS 스캐폴딩 (사용자 결정)
- 선행: PR #2(feature/auth-onboarding) develop 머지 후, feature/ci-cd를 develop에서 분기
- .github/workflows/ci.yml: PR + develop/main push 시 Node 20·npm ci·typecheck·lint·format:check
- package.json: `typecheck: tsc --noEmit` 스크립트 추가
- app.json: ios.bundleIdentifier / android.package = `com.clothic.app` (사용자 결정)
- eas.json: development/preview/production 빌드 프로필 + production iOS submit(플레이스홀더)
- .github/workflows/eas-build.yml: 수동 트리거(workflow_dispatch) production 빌드(EXPO_TOKEN secret 필요)
- docs/CICD.md: CI 설명 + EAS/Apple 계정 준비·빌드·제출 + App Store 체크리스트
- components/DonutChart.tsx: 렌더 중 가변 변수(currentAngle) 재할당 ESLint error 해소
  (reduce 누적 배열로 시작 각도 사전 계산) — CI lint 통과 위해 필수였음

### 검증 (CI 단계 로컬 시뮬레이션)
- npm ci → PASS (lockfile 동기화 확인)
- npm run typecheck → PASS
- npm run lint → PASS (0 errors; warning 다수는 기존 mock 화면, 비차단)
- npm run format:check → PASS
- package.json/app.json/eas.json JSON 유효성 확인
- ⚠️ 미검증: 실제 EAS 빌드·App Store 제출 (Expo/Apple 계정 + EXPO_TOKEN secret 필요 — 사용자만 가능)

### 정정 (이전 주장 철회)
- 이전 대화에서 "package.json이 최초 커밋부터 깨진 JSON"이라고 했으나 **사실이 아님**.
  node JSON.parse로 최초 커밋·현재 모두 유효 JSON 확인. async-storage도 이미 제거된 상태였음.

## 2026-05-31 (저녁)

### 온보딩 화면 시안 반영 (재작업)
- app/onboarding.tsx — 제공된 6컷 시안에 맞춰 레이아웃·일러스트 정밀 재구성
  - 슬라이드 0(welcome): 텍스트 상단 → room_01 배경 위 아바타 일러스트(ImageBackground),
    하단 시작하기 버튼 → 도트 순
  - 슬라이드 1: 날짜(좌)/날씨(우) 분리 행 + 방 배경 카드 아바타 +
    사진/아바타/직접 선택 버튼(Feather image·MaterialCommunityIcons hanger·Feather plus, 아이콘+라벨)
  - 슬라이드 2: 날씨/오늘 기분(드롭다운 박스)/오늘 한 줄(입력 박스) 필드형 카드
  - 슬라이드 3: 옷장 박스(행거 레일·선반) + '잠자는 옷이 많아요' 배너(아이콘·제목·설명·chevron)
  - 슬라이드 4: 월간 리포트 카드 — 헤더/월 네비, 총 코디 수, DonutChart+범례(5색), TOP3 아이템
  - 슬라이드 5(final): 컨페티 + 아바타 → 중앙 정렬 텍스트 → 도트 → 시작하기 버튼
  - 하단 영역 분기: welcome(버튼→도트) / feature(도트 좌·화살표 우) / final(도트→버튼)
  - (후속) welcome '시작하기'를 goStart→goNext로 변경: 첫 화면 버튼이 다음 장으로 진행,
    온보딩 완료는 마지막 슬라이드 '시작하기'에서만. 사용자 결정(2026-05-31).
    웹에서 마우스로 스와이프 불가해 첫 장만 보이던 문제도 함께 해소(버튼만으로 6장 탐색 가능)
  - (후속2) 버튼을 눌러도 안 넘어가던 문제 수정: scrollToIndex(웹에서 getItemLayout 없이 실패)
    → scrollToOffset(next*SW)로 교체 + getItemLayout 지정. 인덱스 추적도
    onViewableItemsChanged → onScroll(offset/SW 반올림)로 변경(웹에서 더 안정적)
  - 기존 DonutChart 컴포넌트 재사용, 색상은 디자인 시스템(colors) 준수
- 범위: 화면 1개(onboarding.tsx)만 수정. 실제 일러스트 PNG(옷장·컨페티 아바타)는
  미보유 → 보유 에셋(base_female_01, room_01)+스타일/이모지로 시안 구조를 재현

### 검증
- npx tsc --noEmit → 에러 없음
- npx eslint app/onboarding.tsx → 통과
- npx prettier --check app/onboarding.tsx → 정합
- ⚠️ 미검증: 실제 렌더링(시각 확인은 사용자 npm run web/실기기 필요)

## 2026-05-31 (오후)

### 웹 SecureStore 크래시 수정
- 증상: `npm run web` 시 `ExpoSecureStore.default.getValueWithKeyAsync is not a function`
  (lib/onboarding.ts → authStore.initialize → app/_layout.tsx)
- 원인: expo-secure-store는 네이티브 전용 — web에 native 함수가 없음
  (lib/supabase.ts는 이미 Platform 가드 있었으나 lib/onboarding.ts는 누락)
- lib/onboarding.ts 수정 — Platform.OS === 'web'일 때 localStorage로 분기
  (supabase.ts의 storage 분기 정책과 동일, 웹에서도 온보딩 플래그 영속)

### 카카오 OAuth 외부 콘솔 진행 (사용자)
- Supabase Kakao provider 활성화 + REST API Key/Client Secret 설정 완료
- "이메일 없는 사용자 허용" 켜짐
- OAuth 흐름이 카카오 인증 서버까지 도달 확인(provider/키 동작)
- 잔여: 카카오 KOE205 — 요청 scope의 `account_email`이 카카오 동의항목 미설정.
  Supabase(GoTrue)가 Kakao에 account_email을 기본 주입하므로 클라이언트 코드로
  제거 불가 → 해결은 카카오 콘솔 동의항목에서 account_email을 "선택 동의"로 활성화

### 홈 카드 배경 적용
- assets/avatar/background/room_01.png 추가 — 방 배경 일러스트(1023×1537)
- components/AvatarCard.tsx 수정 — 단색 View를 ImageBackground로 교체,
  resizeMode="cover"로 카드에 채움. 아바타는 배경 위 중앙 유지, 액션 버튼은 absolute로 오버레이

### 검증
- lib/onboarding.ts: 웹 분기 추가, 네이티브 경로 기존 동작 유지
- AvatarCard.tsx: ImageBackground(RN 표준) import·교체, 구조 이상 없음
- ⚠️ 미검증(사용자): 실제 화면 렌더링 확인(npm run web / 실기기), 카카오 KOE205 해소 후 재시도

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

### 로그인 화면 구현 (Phase 2)
- app/login.tsx 신규 — 이메일/비밀번호 로그인 화면
  - 입력 폼(이메일·비밀번호), useAuthStore().signInWithEmail 호출
  - 로딩 상태(ActivityIndicator)·에러 메시지·버튼 비활성화 처리
  - 성공 시 router.replace('/(tabs)'), 회원가입 링크 router.push('/signup')(다음 항목)
  - KeyboardAvoidingView(iOS), 기존 디자인 시스템(colors/spacing/radius) 준수
- 범위 한정: TODO 규칙대로 "로그인 화면" 항목만 처리.
  회원가입 화면·인증 가드·카카오 OAuth는 다음 항목으로 남김.

### 검증
- npx tsc --noEmit → 에러 없음
- npx eslint app/login.tsx → 통과
- npx prettier --check app/login.tsx → 정합(--write 적용 후)

### 회원가입 화면 구현 (Phase 2)
- app/signup.tsx 신규 — 이메일/비밀번호 회원가입 화면
  - 입력 폼(이메일·비밀번호·비밀번호 확인), useAuthStore().signUpWithEmail 호출
  - 클라이언트 검증: 비밀번호 최소 6자(Supabase 기본), 비밀번호 일치 확인
  - 로딩 상태·에러 메시지·버튼 비활성화, 성공 시 router.replace('/(tabs)')
  - 하단 '로그인' 링크 router.back() → login.tsx의 /signup 링크와 왕복 연결
  - login.tsx와 동일 디자인 시스템·레이아웃 적용
- 범위 한정: TODO 규칙대로 "회원가입 화면" 항목만 처리.
  인증 가드·카카오 OAuth는 다음 항목으로 남김.

### 검증
- npx tsc --noEmit → 에러 없음
- npx eslint app/signup.tsx → 통과
- npx prettier --check app/signup.tsx → 정합(--write 적용 후)

### 인증 가드 + AsyncStorage 정리 (Phase 2)
- 사용자 결정: 온보딩 플래그 저장소를 AsyncStorage→expo-secure-store로 교체
- lib/onboarding.ts 신규 — SecureStore 기반 온보딩 플래그 헬퍼
  (isOnboardingDone / setOnboardingDone, 키 'clothic_onboarding_done')
- stores/authStore.ts 확장 — 부트스트랩 게이트로 onboardingDone 상태 + completeOnboarding() 추가
  - initialize(): getSession()·isOnboardingDone() 병렬 로드 후 initialized 설정
- app/_layout.tsx 전면 수정 — 인증 가드
  - AsyncStorage 제거, useSegments 기반 분기:
    온보딩 미완료→/onboarding, 완료·미로그인→/login, 로그인→/(tabs)
  - 복원 완료(initialized) 전 ActivityIndicator 로딩 표시(깜빡임 방지)
- app/onboarding.tsx 수정 — AsyncStorage 제거 → completeOnboarding() 사용,
  완료 후 router.replace('/login') (미로그인 상태이므로)
- 패키지 제거: @react-native-async-storage/async-storage (npm uninstall)
- ⚠️ 규칙 위반(AsyncStorage 사용) 해소 완료 — TODO 현황 메모 갱신

### 검증
- grep AsyncStorage → 코드 사용처 0건(주석 언급만)
- npx tsc --noEmit → 에러 없음
- npx eslint (_layout/onboarding/authStore/lib/onboarding) → 통과
- npx prettier --check → 정합

### 다음 단계
- Phase 2 남은 항목: 카카오 OAuth Supabase 연동 설정

### 카카오 OAuth 연동 (Phase 2)
- lib/supabase.ts — auth.flowType: 'pkce' 추가 (모바일 OAuth code 교환)
- stores/authStore.ts — signInWithKakao() 추가
  - signInWithOAuth({ provider:'kakao', redirectTo: Linking.createURL('auth/callback'),
    skipBrowserRedirect:true }) → WebBrowser.openAuthSessionAsync로 인증창
  - 리다이렉트 URL의 code를 Linking.parse로 추출 → exchangeCodeForSession
  - 취소(success 아님) 시 에러 없이 종료, 성공 시 onAuthStateChange가 세션 갱신
- app/login.tsx — "카카오로 시작하기" 버튼 + '또는' 구분선, kakaoLoading 상태,
  email/kakao 동시 busy 처리
- docs/KAKAO_OAUTH.md 신규 — 카카오 디벨로퍼스/Supabase 대시보드 설정 가이드 +
  실기기 검증 체크리스트
- 한계 명시: 외부 콘솔(카카오 앱 등록·Supabase provider 키·Redirect URL)과
  실기기 OAuth 왕복은 직접 수행/검증 불가 → 코드+문서까지만 처리

### 검증
- npx tsc --noEmit → 에러 없음
- npx eslint (login/authStore/supabase) → 통과
- npx prettier --check → 정합
- ⚠️ 미검증: 실제 카카오 OAuth 왕복(콘솔 설정 + 실기기 필요, KAKAO_OAUTH.md 체크리스트)

### Phase 2 완료
- DB/RLS · authStore · 로그인/회원가입 화면 · 인증 가드 · 카카오 OAuth(코드) 모두 완료
- 잔여: 카카오 OAuth 실기기 검증(사용자), .env.local 실제 키 입력(사용자)

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
