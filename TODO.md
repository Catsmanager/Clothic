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
- [x] 카카오 OAuth Supabase 연동 설정  ← 코드 완료. Supabase/Kakao 콘솔 기본 설정 완료, 인증창 도달 확인. 잔여: KOE205 — account_email은 Supabase(GoTrue)가 기본 주입하므로 코드 제거 불가, **카카오 콘솔 동의항목에서 account_email "선택 동의" 활성화**로 해소(사용자). 웹 SecureStore 크래시는 lib/onboarding.ts에서 수정 완료

## Phase 3: 에셋 제작
> 2026-07-26 실제 파일 기준: canonical canvas는 **1024×1536px (2:3) RGBA full canvas**다.
> 현재 에셋은 완성형 단일 PNG이며 tint mask/overlay는 구현되지 않았다. 향후 tint 구조를
> 채택할지 결정하기 전에는 신규 에셋에 서로 다른 방식을 섞지 않는다.
- [x] 에셋 폴더 구조 + 현재 규격/네이밍 가이드 동기화
- [x] 아바타 base 1종 + 실제 착장 레이어 36종 등록
  - top 8 / outer 2 / dress 2 / bottom 8 / shoes 4 / hair 6 / accessory 6
- [x] catalog ↔ asset map ↔ disk 동기화 검사 (`npm run avatar:check`)
- [x] cross-platform avatar 등록기 (dry-run, seasons, 현 카테고리, rollback)
- [x] strict CLI + 동일 카테고리 preview 복사 + PNG alpha/component 품질 gate 회귀 테스트
- [x] 직접 드로잉 없는 ImageGen 후보 생성·검수·등록 skill (`$clothic-avatar-pipeline`)
- [ ] 카테고리별 ImageGen 3종 파일럿 후 스타일 기준 확정
- [ ] full-canvas 레이어와 256×256 선택 썸네일 분리
- [ ] 에셋 provenance(제작자/도구/프롬프트/권리/승인) manifest 도입
- [ ] tint mask + shade/outline overlay 채택 여부 결정

## Phase 4: 핵심 화면
- [x] 온보딩 화면  ← 2026-05-31 6컷 시안 반영 재작업 (LOG 참조)
- [x] 홈 화면
- [x] 코디 생성 화면 (아바타 레이어 렌더러)
- [x] 아이템 선택 (카테고리별 탭 + 전체 보기 선택 결과 편집기에 반영)
- [x] 기본 의상 카탈로그와 사용자 내 옷장 분리 + 템플릿 빠른 추가
  - 사용자 `items.catalog_item_id`로 소유 확인
  - 신규 코디는 사용자 item UUID 저장, 기존 정적 id는 조회 호환
  - 통계·챌린지·잠자는 옷장은 확인된 사용자 아이템만 분석
- [x] 코디 저장 (mood, weather, memo)  ← components/SaveOutfitSheet.tsx + outfitStore.addOutfit + create.tsx 연결. Supabase insert. 잔여: is_favorite 마이그레이션·실키 필요
- [x] 코디 목록 / 상세 조회  ← Supabase 연동, 즐겨찾기, 상세 딥링크/새로고침 복구. 잔여: is_favorite 컬럼 마이그레이션(사용자)
- [x] 캘린더 화면  (Supabase outfits 기반)
- [x] 월간 통계 화면  (Supabase outfits 기반 클라이언트 계산)
- [x] 잠자는 옷장 화면  ← 2026-06-12 mock 제거, outfits 실데이터 역산으로 전환 (이슈 #80)
- [x] 챌린지 화면  ← app/challenge.tsx + components/challenge/* (히어로/진행 챌린지/획득 배지/안내 배너). 홈 헤더 award 아이콘으로 진입. **lib/challenges.ts에서 outfits/items 실데이터로 챌린지·배지·요약 계산(mock 아님)** — mock 표기는 2026-06-15 정정

## 색상 방향 (2026-06-11 결정)
> **현재(초기 단계)**: 색은 옷이 가진 속성. 개발자가 카탈로그 옷에 의미 있는 색을 큐레이션해
> 등록하고, 사용자 아이템은 등록 시 색을 고른다. 월간 색상 통계는 카탈로그·사용자 아이템을
> 모두 집계한다(둘 다 의미 있는 색이므로). 비슷한 hex는 팔레트 색상명으로 묶는다.
> **확장 방향 = 방향 3(확장 B)**: "코디할 때마다 색 선택"(피로도 최고)이 아니라,
> **옷은 기본색을 갖되 선택 시 '다른 색이면 변경' 옵션만 제공**(기본값 마찰 0, 필요할 때만 override).
> 사용 피로감 최소화가 핵심 원칙.

## Post-MVP (MVP 이후 검토)
- [ ] 실제 의류 사진 업로드 + 기본 템플릿 매핑
- [ ] 공유 카드 → 공개 챌린지 순서의 커뮤니티 수요 검증 (이슈 #166)
- [ ] 정식 커뮤니티 도입 전 신고·차단·공개 범위·운영 정책 확정
- [~] 옷 색 변경(확장 B) — 코디 저장 시 색 override + 통계 집계  ← 이슈 #87 (사용자 요청, 2026-06-12)
  - [x] 데이터: 코디 저장 시 아이템별 색 저장 (Outfit.itemColors, outfits.item_colors jsonb) — 스키마 변경 필요(사용자)
  - [x] UI: 저장 시트에 아이템별 8색 팔레트(기본값=아이템 원래 색, 강제 선택 없음)
  - [x] 통계: itemColors 있으면 우선, 없으면 기본색으로 집계
  - [ ] 렌더링: 아바타 틴트(`tintColor`)는 미적용 — 통계용 메타데이터로만 반영(A안). 틴트 에셋 완료 후 itemColors로 구동 가능

## Phase 5: 검증 및 출시
- [ ] TEST_PLAN.md 기준 전체 검증
- [x] CI 구축 (정적 검사 + core logic + versioned habit-flow proxy)  ← `.github/workflows/ci.yml`, `HARNESS/evaluator-v4.json`
- [x] 자정/foreground 날짜 갱신 + diary-only 통계 제외 + 핵심 화면 loading/error/retry
- [x] 같은 날짜 복수 row의 대표 코디 결정론·통계 중복 방지 + 저장 이중 탭 guard
- [x] 홈 첫 기록/상세 CTA + 잠자는 옷 추천 handoff + 챌린지 기록 CTA
- [x] AutoResearch schema-v4 runner(manifest-authoritative gate/hash/timeout/pair preflight)와 append-only 실험 로그
- [ ] 실제 D1/D7 반복 기록률 측정 정책·개인정보 범위 결정
- [x] Expo SDK 의존성 정합성 (`expo:check`, `expo-doctor` 21/21)
- [ ] Expo/ESLint upstream audit 잔여 경고 재점검
  - production: Expo CLI/build chain moderate 10건
  - development: ESLint 전이 `brace-expansion` high
  - 현재 자동 해소안은 Expo 46 다운그레이드/ESLint 10 강제 업그레이드라 미적용
- [x] Expo EAS Build/TestFlight workflow 설정  ← main CI 성공 → iOS production build → app-store 승인 → TestFlight upload. 실제 credentials 설정은 사용자
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
