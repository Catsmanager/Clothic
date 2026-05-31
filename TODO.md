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
- [x] constants/colors.ts, constants/spacing.ts 생성  (+ mockItems.ts placeholder 추가)

## Phase 2: DB 및 인증
- [x] Supabase 프로젝트 생성
- [x] profiles / items / outfits 테이블 생성 및 RLS 설정
- [x] authStore (Zustand) 구현  ← stores/authStore.ts (세션 복원·signUp/signIn/signOut)
- [x] 로그인 화면 구현  ← app/login.tsx (이메일/비번 폼, authStore.signInWithEmail)
- [x] 회원가입 화면 구현  ← app/signup.tsx (이메일/비번/확인, authStore.signUpWithEmail)
- [x] 인증 가드 (app/_layout.tsx)  ← 세션·온보딩 기반 가드, AsyncStorage→SecureStore 정리 완료
- [ ] 카카오 OAuth Supabase 연동 설정  ← 코드 완료. Supabase/Kakao 콘솔 기본 설정 완료, 인증창 도달 확인. 잔여: KOE205 — account_email은 Supabase(GoTrue)가 기본 주입하므로 코드 제거 불가, **카카오 콘솔 동의항목에서 account_email "선택 동의" 활성화**로 해소(사용자). 웹 SecureStore 크래시는 lib/onboarding.ts에서 수정 완료

## Phase 3: 에셋 제작
- [x] 에셋 폴더 구조 + 네이밍 가이드 (assets/avatar/{cat}/, README 체크리스트)
- [x] 아바타 base 이미지 제작 (64×128px)  (base_female_01.png)
- [ ] 상의 10종 제작  ← PNG 미제작 (디자이너/툴 작업 필요). 경로는 items.ts에 예약됨
- [ ] 하의 8종 제작
- [ ] 신발 6종 제작
- [ ] 가방 5종 제작
- [ ] 액세서리 4종 제작 (none 포함)
- [x] constants/items.ts 에 메타데이터 등록  ← 33종, imagePath는 문자열 경로(빌드 안전)

## Phase 4: 핵심 화면
- [x] 온보딩 화면  ← 2026-05-31 6컷 시안 반영 재작업 (LOG 참조)
- [x] 홈 화면
- [x] 코디 생성 화면 (아바타 레이어 렌더러)
- [x] 아이템 선택 (카테고리별 탭)
- [ ] 코디 저장 (mood, weather, memo)  ← UI 일부 존재, 영속 저장 없음
- [x] 코디 목록 / 상세 조회  ← app/outfits.tsx·app/outfit/[id].tsx·stores/outfitStore.ts (Supabase 연동, 즐겨찾기 포함). 잔여: is_favorite 컬럼 마이그레이션(사용자), 저장 기능 미구현이라 실데이터 빈 상태
- [x] 캘린더 화면  (mock 데이터)
- [x] 월간 통계 화면  (mock 데이터)
- [x] 잠자는 옷장 화면  (mock 데이터)
- [ ] 챌린지 화면

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
- 구현됨: 온보딩·홈·코디생성·아이템선택·캘린더·통계·옷장 화면 (모두 mock 데이터)
- 미구현: Supabase 연동, 인증(로그인/회원가입), Zustand store, 실제 데이터 영속화
- 에셋: base 아바타 1종만 제작, 나머지는 mockItems.ts 색상 placeholder
- `npx tsc --noEmit` 통과 (에러 없음)

✅ 규칙 위반 해소 (2026-05-31):
- 기존 `@react-native-async-storage/async-storage` 사용·패키지 제거 완료
- 온보딩 플래그를 expo-secure-store(lib/onboarding.ts)로 이관
- 인증 가드 구현 시 함께 정리 (CLAUDE.md "AsyncStorage 금지" 규칙 충족)
