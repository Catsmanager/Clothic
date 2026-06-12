# TODO

> 재점검: 2026-05-30 — 실제 파일과 대조해 체크 상태 정정. 하단 "현황 메모" 참조.

## Phase 0: 문서 정비
- [x] PRD.md Supabase/인증 범위 반영
- [x] ARCHITECTURE.md Supabase 스택 추가
- [x] ADR.md ADR-002 추가
- [x] DATA_MODEL.md 작성
- [x] ASSET_PLAN.md 작성
- [x] DESIGN_SYSTEM.md 작성
- [x] TODO.md 작성
- [x] CLAUDE.md 기술스택 Supabase 반영

## Phase 1: 프로젝트 초기화
- [x] Expo 프로젝트 생성 (`npx create-expo-app`)
- [x] TypeScript strict mode 설정
- [x] ESLint / Prettier 설정  ← flat config + scripts. 기존 코드 12파일 포매팅 미적용(별도 작업)
- [x] Expo Router 설정
- [x] 패키지 설치: @supabase/supabase-js, expo-secure-store, expo-web-browser
- [x] .env.local 생성 (Supabase URL/Key)  ← 빈 placeholder, 실제 키는 사용자 입력 필요
- [x] Supabase 클라이언트 (`lib/supabase.ts`)  ← SecureStore 세션 어댑터
- [x] constants/colors.ts, constants/spacing.ts 생성  (+ items.ts placeholder 카탈로그)

## Phase 2: DB 및 인증
- [x] Supabase 프로젝트 생성
- [x] profiles / items / outfits 테이블 생성 및 RLS 설정
- [x] authStore (Zustand) 구현  ← stores/authStore.ts (세션 복원·signUp/signIn/signOut)
- [x] 로그인 화면 구현  ← app/login.tsx (이메일/비번 폼, authStore.signInWithEmail)
- [x] 회원가입 화면 구현  ← app/signup.tsx (이메일/비번/확인, authStore.signUpWithEmail)
- [x] 인증 가드 (app/_layout.tsx)  ← 세션·온보딩 기반 가드, AsyncStorage→SecureStore 정리 완료
- [ ] 카카오 OAuth Supabase 연동 설정  ← 코드 완료. Supabase/Kakao 콘솔 기본 설정 완료, 인증창 도달 확인. 잔여: KOE205 — account_email은 Supabase(GoTrue)가 기본 주입하므로 코드 제거 불가, **카카오 콘솔 동의항목에서 account_email "선택 동의" 활성화**로 해소(사용자). 웹 SecureStore 크래시는 lib/onboarding.ts에서 수정 완료

## Phase 3: 에셋 제작
> ⚠️ 제작 규칙(2026-06-11 결정): 모든 의류 PNG는 **"틴트 가능한 구조"**로 제작한다.
> 색을 PNG에 굽지 말고, **색 영역 레이어 + 음영/아웃라인 오버레이 레이어**를 분리한다.
> 색 영역은 흰색/회색 단색으로 그려 `tintColor`로 어떤 색이든 입힐 수 있게 하고,
> 음영·아웃라인은 별도 오버레이로 얹어 단색 뭉개짐을 막는다.
> 이렇게 해두면 향후 "옷 색 선택" 기능을 에셋 재제작 없이 코드만으로 붙일 수 있다.
> (색을 PNG에 구우면 색 선택 기능 추가 시 33종 전부 재제작 필요)
- [x] 에셋 폴더 구조 + 네이밍 가이드 (assets/avatar/{cat}/, README 체크리스트)
- [x] 아바타 base 이미지 제작 (64×128px)  (base_female_01.png)
- [ ] 상의 10종 제작  ← 1종 완료(top_002). 나머지 PNG 미제작 (디자이너/툴 작업 필요)
- [ ] 하의 8종 제작  ← 3종 완료(bottom_009/010/011)
- [ ] 신발 6종 제작  ← 3종 완료(shoes_001/002/007)
- [ ] 헤어 제작  ← 2026-06-12 카테고리 개편: 가방 카테고리를 헤어로 교체(상의 위 레이어), 가방은 악세서리 서브카테고리로 이동 (이슈 #76)
- [ ] 액세서리 제작 (가방 포함)  ← 미제작. 빈 카테고리는 "추후 업데이트" 문구 표시
- [x] constants/items.ts 에 메타데이터 등록  ← 2026-06-12 목데이터 제거, 실제 에셋 보유 7종만 등록
- [ ] 상의 10종 제작  ← 틴트 구조(색 영역+음영 분리)로 제작. 경로는 items.ts에 예약됨
- [ ] 하의 8종 제작  ← 틴트 구조로 제작
- [ ] 신발 6종 제작  ← 틴트 구조로 제작
- [ ] 가방 5종 제작  ← 틴트 구조로 제작
- [ ] 액세서리 4종 제작 (none 포함)  ← 틴트 구조로 제작
- [x] constants/items.ts 에 메타데이터 등록  ← 33종, imagePath는 문자열 경로(빌드 안전)

## Phase 4: 핵심 화면
- [x] 온보딩 화면  ← 2026-05-31 6컷 시안 반영 재작업 (LOG 참조)
- [x] 홈 화면
- [x] 코디 생성 화면 (아바타 레이어 렌더러)
- [x] 아이템 선택 (카테고리별 탭)
- [x] 코디 저장 (mood, weather, memo)  ← components/SaveOutfitSheet.tsx + outfitStore.addOutfit + create.tsx 연결. Supabase insert. 잔여: is_favorite 마이그레이션·실키 필요
- [x] 코디 목록 / 상세 조회  ← app/outfits.tsx·app/outfit/[id].tsx·stores/outfitStore.ts (Supabase 연동, 즐겨찾기 포함). 잔여: is_favorite 컬럼 마이그레이션(사용자), 저장 기능 미구현이라 실데이터 빈 상태
- [x] 캘린더 화면  (Supabase outfits 기반)
- [x] 월간 통계 화면  (Supabase outfits 기반 클라이언트 계산)
- [x] 잠자는 옷장 화면  ← 2026-06-12 mock 제거, outfits 실데이터 역산으로 전환 (이슈 #80)
- [x] 챌린지 화면  (mock 데이터)  ← app/challenge.tsx + components/challenge/* (히어로/진행 챌린지/획득 배지/안내 배너). 홈 헤더 award 아이콘으로 진입

## 색상 방향 (2026-06-11 결정)
> **현재(초기 단계)**: 색은 옷이 가진 속성. 개발자가 카탈로그 옷에 의미 있는 색을 큐레이션해
> 등록하고, 사용자 아이템은 등록 시 색을 고른다. 월간 색상 통계는 카탈로그·사용자 아이템을
> 모두 집계한다(둘 다 의미 있는 색이므로). 비슷한 hex는 팔레트 색상명으로 묶는다.
> **확장 방향 = 방향 3(확장 B)**: "코디할 때마다 색 선택"(피로도 최고)이 아니라,
> **옷은 기본색을 갖되 선택 시 '다른 색이면 변경' 옵션만 제공**(기본값 마찰 0, 필요할 때만 override).
> 사용 피로감 최소화가 핵심 원칙.

## Post-MVP (MVP 이후 검토)
- [~] 옷 색 변경(확장 B) — 코디 저장 시 색 override + 통계 집계  ← 이슈 #87 (사용자 요청, 2026-06-12)
  - [x] 데이터: 코디 저장 시 아이템별 색 저장 (Outfit.itemColors, outfits.item_colors jsonb) — 스키마 변경 필요(사용자)
  - [x] UI: 저장 시트에 아이템별 8색 팔레트(기본값=아이템 원래 색, 강제 선택 없음)
  - [x] 통계: itemColors 있으면 우선, 없으면 기본색으로 집계
  - [ ] 렌더링: 아바타 틴트(`tintColor`)는 미적용 — 통계용 메타데이터로만 반영(A안). 틴트 에셋 완료 후 itemColors로 구동 가능

## Phase 5: 검증 및 출시
- [ ] TEST_PLAN.md 기준 전체 검증
- [x] CI 구축 (GitHub Actions: typecheck/lint/format)  ← .github/workflows/ci.yml
- [~] Expo EAS Build 설정  ← eas.json·eas-build.yml·docs/CICD.md 작성. 실제 빌드는 Expo/Apple 계정 필요(사용자)
- [ ] App Store 제출  ← docs/CICD.md 체크리스트 참조 (Bundle ID com.clothic.app)
- [ ] Google Play 제출

> 2026-05-31: CI/CD 구축(feature/ci-cd). 번들 ID com.clothic.app 설정, DonutChart lint error 해소. (LOG 참조)

---

## 현황 메모 (2026-05-30 재점검)

실제 파일 점검 결과, 작업이 TODO 순서(Phase 1~3 백엔드 우선)와 다르게
**Phase 4 화면(UI)을 mock 데이터로 먼저 구현**한 상태로 진행되었다.

확인된 사실:
- 구현됨: 온보딩·홈·코디생성·아이템선택·캘린더·통계·옷장 화면
- 미구현: Supabase 연동, 인증(로그인/회원가입), Zustand store, 실제 데이터 영속화
- 에셋: base 아바타 1종만 제작, 나머지는 constants/items.ts 색상 placeholder
- `npx tsc --noEmit` 통과 (에러 없음)

✅ 규칙 위반 해소 (2026-05-31):
- 기존 `@react-native-async-storage/async-storage` 사용·패키지 제거 완료
- 온보딩 플래그를 expo-secure-store(lib/onboarding.ts)로 이관
- 인증 가드 구현 시 함께 정리 (CLAUDE.md "AsyncStorage 금지" 규칙 충족)
