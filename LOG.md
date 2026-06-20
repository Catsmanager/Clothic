# LOG

## 2026-06-19 (refactor: 아바타 에셋 폴더를 카테고리와 1:1 정렬)

### 처리 항목
- 신규 아이템 파일 prefix·폴더가 논리 카테고리와 어긋난 문제 정리 (원피스·가디건이 `top/`에 들어가 있었음)
- `assets/avatar/dress/`, `assets/avatar/outer/` 폴더 신설 → 폴더 = `Category` 1:1
- 빈 `assets/avatar/bag/` 제거 (`bag`은 카테고리가 아니라 accessory의 subCategory라 죽은 폴더였음)

### 변경
- 파일 이동: `top/top_004_cream_onepiece.png` → `dress/dress_001_cream_onepiece.png`, `top/top_007_cream_cardigan.png` → `outer/outer_001_cream_cardigan.png`
- `constants/itemCatalog.ts`: top 섹션에 섞여 있던 두 항목을 `outer`/`dress` 섹션으로 분리, id·imagePath 갱신 (`top_004`→`dress_001`, `top_007`→`outer_001`)
- `lib/avatarAssets.ts`: 동일 id·require 경로 갱신. preview·layerOrder 값은 그대로 유지해 렌더 결과 보존
- `docs/ITEM_ASSET_FLOW.md`: 폴더 규칙 예시에 outer/dress 추가, "폴더명=Category 1:1" 명시
- 신규 미커밋 아이템이라 DB `outfit` 참조 마이그레이션 불필요. id 참조는 위 두 파일에만 존재함을 grep으로 확인

### 검증
- `npx tsc --noEmit` 통과
- `npx expo lint` 통과 (에러·경고 없음)
- 잔여 참조(`top_004`/`top_007`) grep 0건

## 2026-06-16 (fix: TestFlight 90683 NSMotionUsageDescription 누락 해결)

### 처리 항목
- TestFlight 업로드 시 경고 90683(Missing purpose string / NSMotionUsageDescription) 발생
- 원인: expo-location이 Core Motion 프레임워크에 링크되어 바이너리가 Motion API를 참조하나, `motionUsagePermission: false`로 Info.plist에서 목적 문자열을 제거하고 있었음. Apple은 API 참조가 있으면 사용 여부와 무관하게 목적 문자열을 요구함

### 변경 (app.json)
- expo-location 플러그인 `motionUsagePermission`을 `false` → 사용자용 목적 문자열로 변경 → 다음 EAS 빌드 시 Info.plist에 NSMotionUsageDescription 생성됨

### 검증
- 코드 변경 없음 (app.json 설정만 수정) → tsc/lint 생략. 다음 EAS 빌드에서 효과 검증

## 2026-06-15 (docs: 개인정보 처리방침 코드 대조 정정·보강)

### 처리 항목
- 기존 docs/PRIVACY_POLICY.md 초안을 실제 코드/수집 흐름과 대조해 부정확·누락 보완 (신규 작성 아님 — 기존 문서 개정)
- 확인: 분석/크래시/광고 SDK 없음, 결제 SDK 없음(package.json), Apple·Kakao 로그인 사용, 위치는 When-In-Use 일시 사용·미저장, Supabase 국외 저장

### 변경 (docs/PRIVACY_POLICY.md)
- 시행일 2026-06-15, 문의처 hyeonjij450@gmail.com(앱 contact.tsx에 이미 공개된 주소) 기입
- 수집 항목: Apple 로그인 추가, 프로필·알림설정·날씨·색상·즐겨찾기·인앱알림 명시
- 삭제: "기기/로그(오류 로그) 자동 수집" — 실제 미수집이라 과장 기재 제거, "분석·광고·크래시 도구 미사용" 명시
- 제3자: Apple을 결제가 아닌 로그인으로 정정, "결제 기능 없음" 명시(CLAUDE.md 결제 금지와 일치)
- 신규: 개인정보 국외 이전(Supabase) 조항 추가
- English Summary 동일 내용으로 갱신
- 2026-06-16: 운영자=진현지, 저장 리전=대한민국(서울) 기입. 리전이 국내이므로 "국외 이전" 조항을 "데이터 저장 위치 및 처리 위탁"으로 정정(국내 저장, 인프라는 해외 법인 Supabase, Inc. 운영). 모든 placeholder 해소

### 검증
- 코드 변경 없음 (문서만 수정) → tsc/lint 생략

## 2026-06-16 (feat: 앱 내 개인정보 처리방침 화면을 정식 내용과 동기화)

### 처리 항목
- app/privacy.tsx가 3문단 stub("정식 문서는 공개 전 업데이트")이라 Apple 심사에 약한 신호 → docs/PRIVACY_POLICY.md 확정 내용으로 교체
- 수집항목·이용목적·보관기간·처리위탁(Supabase 대한민국 리전)·이용자 권리·안전성·문의처(운영자 진현지, hyeonjij450@gmail.com) 7개 섹션을 SECTIONS 배열로 구조화해 렌더

### 변경
- app/privacy.tsx — SECTIONS 데이터 + map 렌더, sectionTitle/effectiveDate 스타일 추가. 기존 SafeAreaView/SettingsHeader/ScrollView 구조 유지

### 검증
- npx tsc --noEmit PASS / npx expo lint PASS

## 2026-06-15 (chore: iOS 미사용 권한 제거 — 앱스토어 심사 대비)

### 처리 항목
- 앱스토어 심사 점검 중, app.json의 expo-location 플러그인이 `locationAlwaysAndWhenInUsePermission`만 한글로 지정 → @expo/config-plugins의 createPermissionsPlugin(applyPermissions)이 관리 키 전부를 주입하는 구조라, 빌드 Info.plist에 상시(Always) 위치 2종 + WhenInUse(영어 기본) + NSMotionUsageDescription(영어 기본)까지 들어감을 확인
- 추가로 expo-secure-store 플러그인이 NSFaceIDUsageDescription(영어 기본)을 주입. 단 코드(lib/supabase.ts·lib/keyValueStore.ts)는 SecureStore를 requireAuthentication 없이 사용 → 생체인증 미사용
- 실제 사용 권한은 "사용 중 위치(When In Use)"뿐. 미사용 권한이 선언되면 Apple 5.1.1(목적 문구·미사용 권한)·2.5.4(백그라운드 위치 정당화) 리젝 위험

### 변경
- app.json
  - expo-location: `locationWhenInUsePermission`(한글)로 변경, `locationAlwaysAndWhenInUsePermission`/`locationAlwaysPermission`/`motionUsagePermission`을 `false`로 명시 삭제
  - expo-secure-store: 객체 형태로 바꿔 `faceIDPermission: false`로 NSFaceIDUsageDescription 삭제

### 검증
- `npx expo config --type introspect` → iOS Info.plist 위치 권한이 `NSLocationWhenInUseUsageDescription`(한글) 1종만 남음. NSLocationAlways*/NSMotion/NSFaceID 제거 확인
- `npx tsc --noEmit` PASS / `npx expo lint` PASS (코드 변경 없음, 설정만 수정)

## 2026-06-15 (docs: 챌린지/잠자는 옷장 'mock' 표기 정정 — 실데이터 기반)

### 처리 항목
- 앱스토어 심사 점검 중, TODO.md·USER_ACTION_ITEMS.md가 챌린지 화면을 "mock"으로 표기했으나 실제 코드는 실데이터 기반임을 확인 (문서-코드 불일치)
- lib/challenges.ts의 buildChallengeData가 outfits/items에서 streak·조합·비오는날·배지 등을 모두 계산 → mock 아님. 배너/안내에 placeholder 문구 없음
- 사용자 결정: 동작하는 기능이므로 숨기지 않고 그대로 MVP 포함, 문서만 정정

### 변경
- TODO.md — 챌린지 화면 항목의 "(mock 데이터)" 표기 제거 및 실데이터 기반 명시
- USER_ACTION_ITEMS.md — "결정이 필요한 항목"의 챌린지/잠자는 옷장 mock 관련 항목을 해소 처리

### 검증
- 코드 변경 없음 (문서만 수정) → tsc/lint 생략

## 2026-06-14 (fix: 비밀번호 재설정 링크가 재설정 화면 대신 홈으로 이동)

### 처리 항목
- 이슈 #99 / 작업 브랜치: fix/password-reset-recovery-redirect-99
- 문제: 재설정 이메일은 정상 발송되나 링크 클릭 시 `/reset-password`가 아니라 홈으로 이동
- 원인: 앱이 PKCE 흐름(`flowType: 'pkce'`)을 쓰는데, Supabase verify 엔드포인트가 콜백으로 리다이렉트할 때 `type=recovery`를 떨굼 → 콜백이 재설정 흐름을 구분 못 하고 일반 로그인으로 취급 → 홈(`/(tabs)`)으로 보냄. (Site URL / Redirect URLs 설정은 정상이었음)
- 해결: `redirect_to`에 `intent=recovery` 표식을 직접 심어 콜백이 재설정 흐름을 인식하도록 함

### 신규/변경
- stores/authStore.ts
  - `sendPasswordReset` — `redirect_to`를 `Linking.createURL('auth/callback', { queryParams: { intent: 'recovery' } })`로 변경. Supabase가 `&code=...`를 덧붙여도 표식 유지
  - `handleAuthCallback` — `type=recovery`(implicit) 또는 `intent=recovery`(PKCE, 우리 표식)면 recovery로 인식

### 리뷰에서 발견·반영
- PKCE에선 `exchangeCodeForSession`이 `SIGNED_IN`만 발생시키고 `PASSWORD_RECOVERY` 이벤트는 안 떠서 이벤트 기반 감지는 부적합 → redirect_to 표식 방식 채택 (웹 새로고침·기기 무관하게 동작)
- Kakao/이메일 가입 콜백은 `intent`를 안 붙이므로 영향 없음 (recovery=false → 홈)
- 진단 중 간헐적 `/login` 이동은 일회용 링크 재사용(`otp_expired`) 때문이었고 코드 버그 아님

### 검증
- npx tsc --noEmit → PASS / npx expo lint → PASS
- 웹 실제 동작: 새 메일 → 링크 1회 클릭 → 재설정 화면 정상 진입 확인

## 2026-06-12 (feat: 코디 저장 시 아이템 색상 선택 — 통계 색상 정확도)

### 처리 항목
- 이슈 #87 / 작업 브랜치: feature/outfit-item-color-87
- 문제: 통계 '가장 많이 입은 색상'이 아이템 고정 색(`item.color`)만 집계 → 같은 아이템은 항상 같은 색으로만 카운트되어 실제 착용 색을 반영 못 함(색이 아이템에 1:1로 묶인 구조적 한계)
- 해결: 코디 저장 시 공통 8색 팔레트로 아이템별 색을 고를 수 있게 하고(기본값=원래 색, 강제 선택 없음), 선택 색을 `Outfit.itemColors`로 저장해 통계가 우선 집계. 아바타 그림은 그대로(A안: 통계용 메타데이터). TODO Post-MVP '옷 색 변경(확장 B)'의 데이터+통계+UI 부분 구현

### 신규/변경
- stores/outfitStore.ts — NewOutfit/Outfit에 itemColors(Record<itemId,hex>) 추가, mapRow 폴백(`?? {}`), insert payload에 item_colors
- lib/database.types.ts — outfits Row/Insert/Update에 item_colors 추가
- hooks/useSaveOutfitForm.ts — itemIds→items 입력 변경, 아이템별 색상 상태/기본값/setItemColor 추가
- components/save-outfit/ItemColorPicker.tsx — 신규. 착용 아이템별 색상 선택 UI. **접이식(아코디언)**: 기본은 현재 색만 표시, 탭한 아이템만 팔레트 펼침, 선택 시 접힘 (선택 피로도 최소화 — TODO 색상 방향 노트 반영)
- components/SaveOutfitSheet.tsx — **2단계 마법사**: 1단계 아이템 색상 → 2단계 날씨/기분/메모. 단계 인디케이터·이전/다음 네비. 화면당 항목을 줄여 저장 피로도 감소. (열릴 때 1단계 초기화는 effect 대신 prop 변화 시 렌더 중 보정 — react-hooks set-state-in-effect 회피)
- components/save-outfit/SaveOutfitActions.tsx — 단계별 재사용 위해 라벨/핸들러(secondary·primary) 받도록 일반화
- app/(tabs)/create.tsx — SaveOutfitSheet에 equippedItems 전달
- lib/monthlyStats.ts — `outfit.itemColors[itemId] ?? item.color`로 집계

### 리뷰에서 발견·반영
- 아바타 색/통계 색 불일치 가능성(픽셀 스프라이트는 고정색) → 사용자 합의로 A안(메타데이터만) 채택, 향후 틴트 에셋 완료 시 동일 itemColors로 아바타 구동 가능
- 기존 코디/구 DB 호환: itemColors 옵셔널 폴백으로 마이그레이션 없이 읽기 안전

### 검증
- npx tsc --noEmit → PASS / npx expo lint → PASS

### 남은 문제 (사용자 작업)
- DB 마이그레이션 필요: `alter table outfits add column if not exists item_colors jsonb not null default '{}'::jsonb;` (미적용 시 저장 insert가 실패)

## 2026-06-12 (fix: 즐겨찾기 토글 실패 시 Alert 피드백 추가)

### 처리 항목
- 이슈 #84 / 작업 브랜치: fix/favorite-toggle-error-feedback
- "즐겨찾기 버튼이 동작하지 않는다" 제보 진단: 근본 원인은 DB에 is_favorite 컬럼 미존재(사용자 마이그레이션 필요). 토글은 낙관적 업데이트 후 update 실패 시 조용히 롤백만 되어 사용자에게 무피드백이던 문제를 보완

### 신규/변경
- app/outfits.tsx — onToggleFav를 async로 바꿔 toggleFavorite 반환 에러를 Alert로 안내 (Alert import 추가)
- app/outfit/[id].tsx — 상세 화면 별 버튼도 동일하게 onToggleFav 콜백 추출 + 실패 시 Alert (Alert는 기존 import 활용)
- 코드베이스 관례 준수: create.tsx·item-new.tsx의 Alert.alert('...실패', error)와 동일 패턴

### 검증 (실기동, Expo web + Playwright)
- npx tsc --noEmit → PASS / npx expo lint → PASS
- 별 탭 시: 낙관적 flip(@80ms '즐겨찾기 해제'=켜짐) → PATCH /outfits 400(is_favorite 컬럼 없음) → 롤백('즐겨찾기 추가'=꺼짐). **에러 분기 도달 확정** → 이 시점에 Alert 실행
- Alert 다이얼로그 자체는 react-native-web에서 no-op이라 web에선 미표시 — 네이티브(모바일)에서만 시각 확인 가능. 코드 경로와 표시될 에러 문자열은 검증됨

### 남은 문제 (사용자 작업)
- 근본 해결은 DB 마이그레이션: `alter table outfits add column if not exists is_favorite boolean not null default false;` 실행 시 즐겨찾기 정상 동작
- #78(item_ids text[]) 마이그레이션도 함께 미적용 상태

## 2026-06-12 (feat: 빈 코디 저장 차단 + 통계 색상/스타일 실데이터 검증)

### 처리 항목
- 이슈 #82 / 작업 브랜치: feature/empty-outfit-save-guard
- ① 아이템 0개로 코디 저장이 가능하던 문제 → 저장 버튼 비활성으로 차단·유도
- ② 사용자 등록 아이템의 월간 리포트 색상 집계 실기동 검증
- ③ "많이 입은 스타일" 카드 구현 가능성 판단 → **유지 결정** (PRD 핵심 기능 "스타일 분석" 명시 + 아이템 등록 시 스타일 태그 선택 + monthlyStats 집계 이미 동작. 비어 보였던 건 코디 저장 실패(#78)로 데이터가 없었기 때문)

### 신규/변경
- components/outfit-editor/CreateHeader.tsx — saveDisabled prop 추가 (item-new 저장 버튼의 disabled 관례와 동일: opacity 0.35 + accessibilityState + 접근성 힌트)
- app/(tabs)/create.tsx — 장착 아이템 0개면 저장 버튼 비활성

### 검증 (실기동, Expo web + Playwright)
- npx tsc --noEmit → PASS / npx expo lint → PASS
- 저장 가드: 빈 코디에서 aria-disabled=true·강제 클릭에도 시트 안 열림 / 장착 시 활성·시트 열림 / 해제 시 다시 비활성
- 아이템 등록(UI) → 코디 저장(사용자 아이템 2종) → /outfits 정상 (사용자 아이템은 uuid라 마이그레이션 없이도 저장 가능)
- 통계: 색상 "레드 50% / 블루 50%" 팔레트 이름으로 정확 집계, 아이템 TOP 5 정상, **스타일 #feminine/#chic/#casual 각 1회 정상 집계** — 검증 데이터 정리 완료

### 남은 문제
- outfits.item_ids 마이그레이션(#78)은 여전히 미적용 — 카탈로그 아이템(top_002 등) 코디 저장은 계속 실패 상태 (사용자 작업 필요)
- 스타일 카드 표기가 영문 태그(#feminine)인데 아이템 등록 화면은 한글(페미닌) — 한글 라벨 통일을 후속 작업으로 제안
## 2026-06-12 (feat: 잠자는 옷장 실데이터 전환 — mock 제거, outfits 기반 역산)

### 처리 항목
- 이슈 #80 / 작업 브랜치: feature/sleeping-wardrobe-real-data
- 잠자는 옷장 화면의 mock 데이터(SLEEPING_ITEMS 18종)를 제거하고 DATA_MODEL.md 계산 규칙(outfits에서 마지막 착용일 역산 → 30일 이상)을 실구현

### 신규/변경
- constants/sleepingWardrobe.ts — mock 18종·고정 카운트 제거. SleepingCategory를 앱 표준(top/bottom/shoes/hair/accessory)으로 통일(#74 피드백), SLEEPING_THRESHOLD_DAYS(30)·라벨 헬퍼 추가
- lib/sleepingWardrobe.ts 신규 — buildSleepingItems(outfits, items): 아이템별 마지막 착용일 역산 후 30일 이상만 반환. getSleepingDays 공용화(SleepingItemList의 중복 구현 제거)
- hooks/useSleepingWardrobe.ts — itemStore(카탈로그+사용자 아이템)·outfitStore 실데이터 연결, fetch on mount, 카테고리별 counts·totalCount 노출. 필터/정렬 로직은 유지
- components/sleeping-wardrobe/SleepingCategoryTabs.tsx — counts prop화, 새 카테고리 라벨·아이콘(신발 footsteps, 헤어 cut, 악세서리 glasses)
- components/sleeping-wardrobe/SleepingFilterSheet.tsx — 분류 칩 한글 라벨 매핑 (세부 필터는 styleTags 기반)
- components/sleeping-wardrobe/SleepingItemList.tsx — "데이터 없음"(아직 잠자는 옷이 없어요)과 "필터 결과 없음" 빈 상태 구분
- app/(tabs)/more.tsx — 훅의 totalCount/counts 연결

### 리뷰에서 확인한 사항
- 착용 기록이 없는 아이템은 판정 기준일이 없어 제외(DATA_MODEL 규칙 그대로). "등록만 하고 한 번도 안 입은 사용자 아이템"을 포함할지는 정책 결정 필요 — 후속 검토
- 카탈로그 아이템의 잠자는 판정은 outfits.item_ids 마이그레이션(#78) 적용 후부터 동작 (현재 DB는 uuid[]라 카탈로그 id가 코디에 저장되지 못함)

### 검증 (실기동, Expo web + Playwright + Supabase 픽스처)
- npx tsc --noEmit → PASS / npx expo lint → PASS
- 픽스처(사용자 아이템 3종 + 코디 3건: 63일 전·42일 전·2일 전)로 확인:
  - 잠자는 옷 2개 집계 (2일 전 착용 아이템은 제외) / 카테고리 카운트 전체2·상의1·신발1·나머지0
  - 수면일수 배지 63일째·42일째, 마지막 착용일 표기 정확
  - 정렬 토글(오래된 순↔최신 순) 순서 반전 확인
  - 빈 카테고리 탭 → "조건에 맞는 옷이 없어요" + 필터 초기화 동작
  - 필터 시트: 분류 한글 라벨, styleTags 세부 필터(vintage → 부츠만) 동작
  - 픽스처 삭제 후 기본 빈 상태 "아직 잠자는 옷이 없어요" 표시 확인 (검증 데이터 정리 완료)

## 2026-06-12 (fix: 코디 저장 실패 원인 규명 — outfits.item_ids uuid[]→text[] 마이그레이션)

### 처리 항목
- 이슈 #78 / 작업 브랜치: fix/outfit-item-ids-text-array
- 코디저장→통계 flow 실기동 검증(Expo web + Playwright) 중 발견: 아이템을 장착한 코디 저장이 실패 (`invalid input syntax for type uuid: "top_002"`, 22P02)

### 원인
- DB `outfits.item_ids`가 `uuid[]`(DATA_MODEL.md 설계)인데, 앱 전체(에디터→아바타 렌더→캘린더→통계)는 카탈로그 스프라이트 id(문자열)를 item id로 사용
- lib/database.types.ts는 이미 `string[]`이라 타입체크로는 잡히지 않음. 빈 배열은 통과해서 "빈 코디만 저장되는" 형태로 증상이 가려짐
- 웹에서는 Alert.alert가 no-op이라 저장 실패가 무피드백으로 삼켜짐 (모바일에서는 Alert 표시됨)

### 신규/변경
- docs/DATA_MODEL.md — outfits 스키마 `item_ids text[]`로 정정, 2026-06-12 마이그레이션 블록 추가, itemIds 주석을 "카탈로그 id 또는 Item.id 혼합"으로 명확화. 코드 변경 없음
- **사용자 작업 필요**: Supabase SQL Editor에서 `alter table outfits alter column item_ids type text[] using item_ids::text[];` 실행

### 검증 (실기동, Expo web + Playwright)
- 로그인 → 코디만들기 → top_002/bottom_010/shoes_001 장착 → 저장 시트(날씨/기분/메모) → 저장: **실패 재현** (시트 유지, 통계 미반영)
- 필드별 분리 insert 진단: mood/weather/memo 단독 OK, item_ids에 'top_002' 포함 시에만 22P02 → 원인 확정
- 헤어/악세서리 빈 카테고리 "추후 업데이트될 예정입니다" 문구 정상 표시 확인
- 빈 코디 저장은 성공: /outfits 목록 표시, 통계 "총 코디 수 1회" 집계 정상 (검증 데이터는 삭제 완료)
- 마이그레이션 적용 후 풀 플로우 재검증 필요

## 2026-06-12 (feat: 목데이터 제거 + 가방→헤어 카테고리 교체 + 빈 카테고리 안내 문구)

### 처리 항목
- 이슈 #76 / 작업 브랜치: feature/real-assets-catalog-cleanup
- 실제 아바타 PNG 에셋 추가(사용자 제작: top_002, bottom_009~011, shoes_001/002/007, base 갱신)에 맞춰 카탈로그를 실물 기준으로 정리

### 신규/변경
- constants/itemCatalog.ts — 실제 에셋 보유 7종만 남기고 목데이터 26종 제거 (accessory '없음' 포함)
- constants/items.ts — Category에서 'bag' → 'hair' 교체. 헤어는 RENDER_ORDER에서 상의 위 레이어. 가방은 accessory 서브카테고리('가방')로 이동
- components/outfit-editor/CategoryRail.tsx — 카테고리 이모지 👜 → 💇
- components/outfit-editor/ItemPickerPanel.tsx, components/item-select/ItemGrid.tsx — 빈 카테고리/서브카테고리에 "추후 업데이트될 예정입니다 / 조금만 기다려주세요" 빈 상태 문구 추가
- lib/avatarAssets.ts — 실제 PNG require 매핑 + 미리보기 스케일(사용자 선행 작업 포함)

### 리뷰에서 확인한 사항
- 'bag'/'accessory_004' 참조는 constants/items.ts 외에 없음 — 컴포넌트들은 ITEM_CATEGORIES/CATEGORY_LABELS를 동적으로 참조하므로 타입 교체만으로 전파됨
- 잠자는 옷장의 '신발/가방'은 자체 SleepingCategory 타입(별개 기능)이라 영향 없음
- 주의: DB(items.category='bag')에 저장된 사용자 아이템이 있다면 isCategory 가드에 걸려 화면에서 제외됨. 과거 코디의 삭제된 목 아이템 id는 렌더 시 자동 무시됨(크래시 없음)

### 검증
- npx tsc --noEmit → PASS
- npx expo lint → PASS (error/warning 없음)
## 2026-06-11 (잠자는 옷장 피드백 반영: 죽은 어포던스 제거·수면일수 배지·빈 상태 개선)

### 처리 항목
- 이슈 #74 / 작업 브랜치: feature/sleeping-wardrobe-ui-feedback
- 잠자는 옷장 화면 검토 후 UI 문제 반영

### 신규/변경
- components/sleeping-wardrobe/SleepingItemList.tsx
  - 아이템 카드가 onPress 없는 TouchableOpacity + chevron(>)이라 "탭하면 이동"처럼 보이던 죽은 어포던스 제거 (상세 화면이 없으므로 비인터랙티브 View로)
  - 수면 일수를 텍스트("337일")에서 pill 배지("337일째")로 변경, 180일 이상 장기 수면은 danger 톤으로 강조
  - 빈 상태에 "필터 초기화" 버튼 추가(기존 clearFilters 연결) — 안내문만 있고 복구 동선이 없던 문제
- app/(tabs)/more.tsx — SleepingItemList에 hasActiveFilter/onClearFilters 전달

### 피드백만 (이슈 #74에 기록, 별도 작업 제안)
- 화면 전체가 mock 데이터(SLEEPING_ITEMS) — itemStore·outfitStore 실데이터로 "마지막 착용일" 계산 가능 (PRD 핵심 요구의 실구현)
- 카테고리 체계가 앱 표준(top/bottom/shoes/bag/accessory)과 불일치 — 실데이터 전환 시 정리
- 카테고리 탭·툴바 sticky 고정 검토

### 검증
- npx tsc --noEmit → PASS
- npx expo lint → PASS
## 2026-06-11 (월간 리포트 피드백 반영: 색상명 표시·집계 기준·레이아웃 정렬)

### 처리 항목
- 이슈 #71 / 작업 브랜치: feature/monthly-stats-feedback (PR #70 머지로 develop 정상화 → develop 위로 리베이스, PR #72 base를 develop으로 전환)
- 월간 리포트 화면 검토 후 버그·UX 문제 반영 + 색상 방향 결정 반영

### 신규/변경
- constants/colorPalette.ts 신규 — 8색 공용 팔레트 + hex→팔레트 최근접 매칭(resolvePaletteColor). app/item-new.tsx의 로컬 COLOR_OPTIONS/COLOR_LABELS을 이 모듈 기반으로 교체(중복 제거)
- lib/monthlyStats.ts — 색상 집계를 hex 원값 대신 팔레트 색상명 기준으로 그룹화(#1C1C1C·#2A2A2A → 블랙). **색상 방향 결정: 색은 옷이 가진 속성으로 보고 카탈로그(개발자 큐레이션)·사용자 아이템을 모두 집계**(어제 검토 중 논의된 "카탈로그 제외"안은, 개발자가 카탈로그 색을 의미 있게 등록하기로 하면서 철회). topItems에 id 포함, 0% 항목 필터
- components/monthly-stats/TopColorsCard.tsx — 범례에 hex 대신 색상명 표시, 방어용 빈 상태(아이템 삭제로 색 못 구한 경우) 추가
- components/monthly-stats/TopItemsCard.tsx — React key를 label(중복 가능) → id로
- components/monthly-stats/TopStylesCard.tsx — 태그/횟수가 좌우로 분리돼 대응을 알 수 없던 레이아웃을 행 단위(태그+횟수)로 재구성
- components/monthly-stats/TotalOutfitsCard.tsx — diff 0일 때 "지난 달보다 0회 ↑" → "지난 달과 동일"(중립색)
- components/monthly-stats/MonthNavigator.tsx — nextDisabled prop 추가(미래 달 이동 차단), 접근성 라벨 보강
- app/(tabs)/stats.tsx — 월간 카드(월 의존)를 먼저, 옷장 현황 카드(월 무관)를 뒤로 재배치. 현재 달에서 다음 달 버튼 비활성화. 공유 메시지 색상도 색상명으로 표기
- TODO.md — "색상 방향(2026-06-11 결정)" 섹션 추가: 현재=색은 옷 속성·모두 집계, 확장=방향 3(확장 B, 기본색+선택 시 색 변경 옵션, 피로감 최소화). Post-MVP 항목을 확장 B 기준으로 갱신

### 검증
- npx tsc --noEmit → PASS
- npx expo lint → PASS (exit 0)
- Metro(8081) iOS 번들 200 정상

## 2026-06-11 (fix: homeHint.ts 병합 오류 수정 — develop 빌드 실패 해소)

### 처리 항목
- 이슈 #69 / 작업 브랜치: fix/home-hint-bad-merge
- origin/develop의 lib/homeHint.ts에 구버전(SecureStore 직접 사용)과 신버전(keyValueStore 사용)이 한 파일에 합쳐진 채 커밋되어 있어(잘못된 충돌 해결 추정) tsc·Metro 번들링이 모두 실패하던 문제

### 신규/변경
- lib/homeHint.ts — keyValueStore 기반 신버전(#63 리팩토링 의도)만 남기고 구버전 잔재 제거. 함수 시그니처 동일

### 검증
- npx tsc --noEmit → PASS
- npx expo lint → PASS
- npx expo start --port 8081 → packager-status:running, iOS 번들 200(약 9.3MB)·Web 번들 정상 (수정 전에는 양쪽 모두 SyntaxError)

## 2026-06-09 (PRD 스코프 정합: 알림 화면 추가)

### 처리 항목
- 이슈 #65 / 작업 브랜치: docs/prd-add-notifications-scope
- 최근 추가된 인앱 알림 화면(app/notifications.tsx 등)이 PRD MVP 범위 목록에 없어 스코프 불일치 → 기능 유지 결정에 따라 PRD를 코드에 맞춤

### 신규/변경
- docs/PRD.md — MVP 범위에 "알림 화면 (인앱 알림 목록 — 푸시 알림 아님)" 추가
- docs/PRD.md — 제외 범위의 "푸시 알림"에 단말 푸시 발송만 제외이며 인앱 알림 목록은 포함임을 명시
## 2026-06-09 (안티패턴 정리: 타입 우회 + 스토리지 폴백 중복)

### 처리 항목
- 이슈 #63 / 작업 브랜치: refactor/storage-dedup-tabbar-typing

### 신규/변경
- app/(tabs)/_layout.tsx — webStickyTabBar의 `as never` 제거
  - web 전용 값 `position: 'sticky'`만 `as ViewStyle['position']`로 캐스팅, 변수는 `ViewStyle | null`로 타입 지정 → bottom/zIndex 타입 체크 복구
- lib/keyValueStore.ts 신규 — `isWeb ? localStorage : SecureStore` 폴백을 `getStoredValue`/`setStoredValue` 단일 모듈로 추출
- lib/onboarding.ts, lib/homeHint.ts — 복붙된 폴백 로직을 keyValueStore 헬퍼 사용으로 교체(각 ~22줄 → ~11줄). 함수 시그니처 유지

### 검증
- npx tsc --noEmit → PASS
- npx eslint (변경 4파일) → PASS
## 2026-06-11 (HARNESS 문서 정비: CLAUDE.md 연결 및 중복·오타 정리)

### 처리 항목
- 이슈 #67 / 작업 브랜치: docs/harness-cleanup
- HARNESS/*.md가 CLAUDE.md에서 참조되지 않아 Claude Code가 자동으로 읽지 않는 문제(죽은 설정) 및 문서 간 중복·충돌 정리

### 신규/변경
- CLAUDE.md — 작업 방식 섹션을 @HARNESS 임포트로 교체(router/context/loop/roles 자동 로드), 검증 명령어 섹션 신설(tsc/lint), TODO 규칙을 "TODO 진행 요청 시"로 범위 한정
- HARNESS/router.md — 규칙 섹션의 의미 없는 "9" 한 줄 제거(오타)
- HARNESS/context.md — 문서 우선순위 명시(PRD > ADR > 기타), 문서·코드 불일치 시 확인 후 수정 규칙 추가
- HARNESS/roles.md — loop.md Report와 중복되던 최종 답변 형식 제거, loop.md Report로 일원화
- HARNESS/loop.md — Report 항목에 "리뷰에서 발견·수정한 문제" 추가

### 비고
- 문서 변경만. 코드 변경 없음.

## 2026-06-07 (설정/프로필 + 계정 삭제 + 로고)

### 처리 항목
- 이슈 #46(번들), #45(계정 삭제) / 작업 브랜치: feature/profile-settings-and-logo

### 신규/변경
- 설정/프로필/약관/개인정보/문의/앱정보 화면, 홈 메뉴 시트, 약관 링크 컴포넌트
- 계정 삭제: supabase/functions/delete-account(Edge Function), authStore.deleteAccount, app/profile.tsx UI(2단계 확인)
  - Edge Function은 JWT 검증 후 service_role로 outfits/items/profiles + auth 계정 삭제
  - 배포 필요(사용자): `supabase functions deploy delete-account`
- tsconfig: supabase/functions를 앱 타입체크에서 제외
- 앱 로고: icon/splash/favicon/android-icon 에셋 교체(1024² 아이콘), app.json adaptive 배경색 변경
- 통계/잠자는 옷장 화면 보강

### 검증
- npx tsc --noEmit → PASS
- npx expo lint → PASS

## 2026-06-01 (챌린지 화면 구현)

### 처리 항목
- TODO: Phase 4 — 챌린지 화면 (제공된 디자인 시안 기준, mock 데이터)
- 작업 브랜치: feature/challenge-screen

### 신규/변경
- constants/challenges.ts 신규
  - Challenge/Badge/ChallengeSummary 타입 + mock 데이터(히어로 통계, 챌린지 4종, 배지 5종)
  - 아이콘은 string literal union으로 두고 표현은 컴포넌트에서 매핑 (constants에 RN 의존 없음)
- components/challenge/ChallengeHeader.tsx 신규 — 뒤로가기 + 타이틀 + 도움말 (outfits.tsx 헤더 패턴)
- components/challenge/ChallengeHeroCard.tsx 신규 — 격려 메시지·연속/주간 기록 통계·아바타(OutfitAvatar)·하트 말풍선
- components/challenge/ChallengeListItem.tsx 신규 — 챌린지 카드(아이콘/제목/설명/상태칩/진행바/진행도/chevron)
- components/challenge/ChallengeList.tsx 신규 — "진행 중인 챌린지" 섹션 + 진행 개수 + 리스트
- components/challenge/BadgeShelf.tsx 신규 — "획득한 배지" 가로 스크롤, 잠금 배지 표시
- components/challenge/ChallengeBottomBanner.tsx 신규 — 자동 진행 안내 배너
- app/challenge.tsx 신규 — 위 컴포넌트 조립 (잠자는 옷장 화면과 동일 구조)
- components/HomeHeader.tsx 변경 — 동작 없던 bell 아이콘을 award 아이콘으로 교체, /challenge 진입 동선 연결
  - (PRD가 푸시 알림을 MVP 제외하므로 bell 아이콘은 의미 없음 → 챌린지 진입으로 활용)

### 비고
- 진행도/배지는 mock. 추후 코디 저장 데이터 기반 실제 진행 로직으로 대체 예정(별도 항목).
- 디자인 시스템 토큰(colors/spacing/radius), 카드/태그/아이콘 규칙 준수. any 미사용, import type 사용.

### 검증
- npx tsc --noEmit → PASS
- eslint (변경 파일) → PASS
- npx prettier --check (변경 파일) → PASS
## 2026-06-07 (홈 화면 실시간 날씨 연동)

### 처리 항목
- 홈 DateWeatherBar의 하드코딩 날씨(`⛅ 22°C`)를 실제 API 연동으로 교체
- 작업 브랜치: feature/weather-api / 이슈 #37

### 신규/변경
- lib/weather.ts 신규 — Open-Meteo 현재 날씨 조회(`fetchCurrentWeather`), WMO 코드→아이콘/설명 매핑. API 키 불필요(무료, 비용 없음)
- hooks/useWeather.ts 신규 — expo-location 권한 요청 → 현재 위치 → 날씨 조회. 권한 거부/실패 시 'error'
- components/DateWeatherBar.tsx 변경 — useWeather 사용, 성공 시 아이콘+기온 표시, 그 외(로딩/에러)엔 날짜만 표시
- app.json 변경 — expo-location 플러그인 + 위치 권한 안내 문구 추가
- package.json — expo-location 추가

### 비고
- Open-Meteo는 API 키·카드 등록이 없어 과금 위험 0.
- 위치 권한 거부 또는 조회 실패 시 날씨 영역을 숨기고 날짜만 표시(폴백).
- 함께 작업한 AvatarCard 변경(방 배경 비율 수정·액션 버튼 제거)은 별도 변경분으로 이 브랜치에 미포함.

## 2026-06-01 (코디 저장 시트 책임 분리)

### 처리 항목
- GitHub Issue: #32 Refactor save outfit sheet responsibilities
- 작업 브랜치: feature/refactor-save-outfit-sheet

### 신규/변경
- hooks/useSaveOutfitForm.ts 신규
  - mood/weather/memo 상태, chip toggle, 저장 input 생성 로직을 sheet UI에서 분리
- components/save-outfit/OptionChipGroup.tsx 신규
  - 날씨/기분 chip 그룹 렌더링 공통화
- components/save-outfit/SaveOutfitMemoField.tsx 신규
  - 저장 시트 memo 입력 UI 분리
- components/save-outfit/SaveOutfitActions.tsx 신규
  - 취소/저장 버튼과 saving indicator UI 분리
- components/SaveOutfitSheet.tsx 축소
  - 기존 218줄 → 90줄
  - modal shell, title, 섹션 조립, 저장 submit 연결만 담당

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS
- git diff --check → PASS

## 2026-06-01 (캘린더 화면 책임 분리)

### 처리 항목
- 완료된 리팩토링 GitHub Issue 정리: #12, #14, #16, #18, #20, #22, #24, #26, #28 닫기
- GitHub Issue: #30 Refactor calendar screen responsibilities
- 작업 브랜치: feature/refactor-calendar-screen

### 신규/변경
- lib/calendar.ts 신규
  - 6주 캘린더 cell 생성 로직을 route 화면에서 분리
- hooks/useCalendarMonth.ts 신규
  - 연/월 이동, 오늘 날짜 key, 선택 날짜 상태, 월별 cell 계산을 hook으로 분리
- components/calendar/CalendarHeader.tsx 신규
  - 월 이동 헤더 UI 분리
- components/calendar/CalendarGrid.tsx 신규
  - 요일 헤더, 날짜 grid, 날짜 선택, mini avatar 렌더링 분리
- components/calendar/SelectedOutfitCard.tsx 신규
  - 선택 날짜의 날씨/아이템/memo 상세 카드 분리
- app/(tabs)/calendar.tsx 축소
  - 기존 335줄 → 54줄
  - route 화면은 outfit fetch, 날짜별 outfit map, 선택 outfit item 파생, 섹션 조립만 담당

### 검증
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS
- git diff --check → PASS

## 2026-06-01 (공통 코디 아바타 렌더링 분리)

### 처리 항목
- GitHub Issue: #22 Refactor shared outfit avatar rendering
- 작업 브랜치: feature/refactor-outfit-avatar

### 신규/변경
- components/OutfitAvatar.tsx 신규
  - 현재 코디 화면들이 공통으로 쓰는 base avatar 이미지 렌더링을 단일 컴포넌트로 분리
- components/AvatarCard.tsx
  - 홈 카드의 직접 `BASE_AVATAR` import 제거 후 `OutfitAvatar` 사용
- components/outfit-editor/AvatarPreview.tsx
  - 코디 생성 preview의 base avatar 렌더링을 `OutfitAvatar`로 교체
- app/(tabs)/calendar.tsx
  - 캘린더 mini avatar 렌더링을 `OutfitAvatar`로 교체
- app/outfits.tsx, app/outfit/[id].tsx
  - 코디 목록/상세의 base avatar 렌더링을 `OutfitAvatar`로 교체
- 온보딩 일러스트는 프레젠테이션 전용 시안이므로 이번 공통화 범위에서 제외
## 2026-06-01 (아이템 카탈로그 데이터 모듈 분리)

### 처리 항목
- GitHub Issue: #28 Refactor item catalog data module
- 작업 브랜치: feature/refactor-item-catalog-data

### 신규/변경
- constants/itemCatalog.ts 신규
  - 33개 static item catalog 배열을 전용 데이터 모듈로 분리
- constants/items.ts 축소
  - 기존 373줄 → 68줄
  - Category/StyleTag/CatalogItem 타입, category label/subcategory/render order, helper 함수 public API 유지
  - 기존 `ITEMS`, `getItemsByCategory`, `getItemById`, `isCategory` import 경로 유지

### 검증
- item id 개수 확인 → 33개
- npm run typecheck → PASS
- npm run lint → PASS
- npx prettier --check 변경 파일 → PASS
- git diff --check → PASS
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
## 2026-06-01 (아이템 선택 화면 책임 분리)

### 처리 항목
- GitHub Issue: #26 Refactor item select screen responsibilities
- 작업 브랜치: feature/refactor-item-select-screen

### 신규/변경
- hooks/useItemSelect.ts 신규
  - route category 검증, active subcategory 상태, category label, filtered items 계산 분리
- components/item-select/ItemSelectHeader.tsx 신규
  - 아이템 선택 헤더 UI 분리
- components/item-select/ItemSubCategoryTabs.tsx 신규
  - 서브카테고리 탭 UI 분리
- components/item-select/ItemGrid.tsx 신규
  - 3열 아이템 그리드와 카드 렌더링 분리
- app/item-select.tsx 축소
  - 기존 182줄 → 32줄
  - 라우트 화면은 hook 호출, router.back 연결, 섹션 조립만 담당
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
