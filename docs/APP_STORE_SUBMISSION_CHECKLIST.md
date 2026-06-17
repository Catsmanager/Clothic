# 앱스토어 제출 — 내가 해야 할 일

기준일: 2026-06-16
대상: Clothic (iOS 우선, Android 동일 흐름)

> 이 문서는 **콘솔/계정/콘텐츠 작업**처럼 코드로 처리할 수 없어 직접 해야 하는 일만 모았다.
> 코드로 끝난 항목은 맨 아래 "코드에서 완료된 것"에 정리.

---

## 🔴 제출 전 반드시 (안 하면 리젝)

### 1. 아바타 아이템 에셋 채우기
- [ ] 빈 카테고리 없이 코디를 완성할 수 있는 수준까지 PNG 제작·배치
- [ ] `constants/itemCatalog.ts`의 `imagePath`와 실제 파일명 일치 확인
- 규격·좌표·레이어 규칙: `docs/ITEM_ASSET_FLOW.md`, `USER_ACTION_ITEMS.md`의 "아바타/의상 에셋 상세 규격" 참조
- 현재: 33종 메타데이터 중 실제 PNG는 약 7종 → 나머지 placeholder 상태

### 2. 심사용 데모 계정 준비
- [ ] 테스트용 이메일 계정 1개 생성(가입 후 코디 몇 개 저장해 화면이 비지 않게)
- [ ] App Store Connect → 앱 버전 → "App Review Information"에 데모 계정 이메일/비밀번호 입력
- 이유: 로그인 필수 앱은 심사관이 로그인 못 하면 리젝

### 3. 개인정보처리방침 공개 URL 호스팅
- [x] `docs/PRIVACY_POLICY.md` 내용을 공개 웹 URL로 게시
  - 가장 쉬운 방법: GitHub Pages(리포 Settings → Pages) 또는 Notion 공개 페이지
- [x] 확보한 URL을 App Store Connect → 앱 개인정보 → "개인정보 처리방침 URL"에 입력
- 문서는 작성 완료(운영자 진현지, 대한민국 리전 반영). 호스팅만 하면 됨

### 4. App Privacy(데이터 수집 신고) 작성
App Store Connect → 앱 개인정보에서 아래 항목 신고:
- [x] 이메일 주소 — 앱 기능/계정 (추적 안 함)
- [x] 위치(대략적) — 앱 기능(날씨), 저장 안 함, 추적 안 함
- [x] 사용자 콘텐츠(코디 기록) — 앱 기능
- 분석/광고/크래시 도구 없음 → 해당 항목 모두 "수집 안 함"

---

## 🟡 제출에 필요 (스토어 등록 정보)

### 5. 스토어 등록용 콘텐츠
- [ ] 앱 아이콘 최종본 확인(현재 `assets/icon.png`)
- [ ] 스크린샷(필수 사이즈: 6.7"/6.5" 등 iPhone 기준 1세트 이상)
- [ ] 앱 이름·부제·설명·키워드·카테고리
- [ ] 지원 URL(문의 페이지 또는 이메일)

### 6. 빌드 & 계정
- [ ] Apple Developer 계정 / App Store Connect 앱 생성 (Bundle ID `com.clothic.app`)
- [ ] EAS Build로 iOS 빌드 생성 후 App Store Connect 업로드
- [ ] (Android 동시 출시 시) Google Play Console 앱 생성 + 빌드
- 참고: `eas.json`, `docs/CICD.md`

---

## ✅ 제출 전 점검(권장)

- [ ] `TEST_PLAN.md` 기준 수동 검증(인증/코디/탭 화면) — 크래시 0 확인
- [ ] 이메일 로그인 / Apple 로그인 / 카카오 로그인 실제 동작 확인
- [ ] 계정 삭제 → 데이터 전부 삭제되는지 확인
- [ ] 날씨(위치 권한 허용/거부) 동작 확인

---

## 결정해두면 좋은 것

- [x] 1차 출시에 카카오 로그인 포함 여부 (포함 시 Apple 로그인 의무 — 이미 구현되어 있음)
- [ ] Android 동시 출시 여부 (iOS 먼저도 가능)

---

## 코드에서 완료된 것 (참고 — 추가 작업 불필요)

- ✅ 챌린지 화면: mock 아님, 실데이터 기반 정상 동작 (문서 표기만 정정)
- ✅ 계정 삭제: 앱 UI → Edge Function 연결 정상 (Apple 5.1.1(v) 충족)
- ✅ Sign in with Apple: 구현 완료 (`usesAppleSignIn: true`)
- ✅ iOS 미사용 권한 제거: 위치는 "사용 중에만" 1종만 남김, 상시 위치·모션·Face ID 권한 삭제
- ✅ 개인정보처리방침 문서(`docs/PRIVACY_POLICY.md`) 작성 완료
- ✅ 앱 내 개인정보처리방침 화면(`app/privacy.tsx`) 정식 내용과 동기화
