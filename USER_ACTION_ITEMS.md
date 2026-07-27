# User Action Items

기준일: 2026-07-27

Codex가 코드만으로 완료할 수 없거나 사용자 계정·콘솔·디자인 승인이 필요한 작업만 정리한다.

## 바로 할 일

- [ ] Kakao OAuth KOE205 해결
  - 카카오 개발자 콘솔에서 `account_email` 동의항목을 `선택 동의`로 활성화
  - 설정 후 카카오 로그인 완료 흐름 재확인
- [ ] Supabase 운영 DB 마이그레이션 상태 확인
  - `outfits.is_favorite boolean not null default false`
  - `outfits.item_colors jsonb`
  - repository의 fresh migration 순서(`profiles` 생성 전 alter)를 별도 이슈로 정리
- [ ] GitHub CLI/App 인증 복구
  - 현재 로컬 `gh` 토큰이 만료되어 이슈·PR 자동 생성이 불가능
  - `gh auth login -h github.com` 후 repository 접근 확인

## 아바타 에셋

현재 canonical 규격은 base와 등록 레이어가 실제로 사용하는 **1024×1536px (2:3) RGBA full canvas**다. 과거 64×128, 1:2, `@2x`, 별도 `bag` 카테고리 규칙은 폐기했다.

- [ ] 새 에셋의 디자인/메타데이터 승인
  - 카테고리: `top`, `outer`, `bottom`, `dress`, `shoes`, `hair`, `accessory`
  - 가방은 `accessory` 하위 분류
  - 이름, 기본색, style tags, seasons 확인
- [ ] 직접 그리지 않을 때 `$clothic-avatar-pipeline`로 카테고리별 3종 파일럿 제작
  - base + 승인된 같은 카테고리 에셋을 ImageGen reference로 사용
  - 생성 결과는 후보로만 취급하고 정렬·halo·stray pixel을 사람 눈으로 승인
  - 승인 전 기존 catalog ID 교체 금지
- [ ] 별도 썸네일 파이프라인 도입 여부 결정
  - 현재 선택 그리드는 1024×1536 full layer를 사용해 번들·디코드 비용이 큼
  - 후보 규격: 앱 레이어 512×768, 목록 썸네일 256×256
  - 전환 시 base와 모든 레이어를 같은 2:3 비율로 일괄 마이그레이션
- [ ] 색상 tint 구조 결정
  - 현재 구현: 완성형 단일 PNG + 저장 색상은 통계 메타데이터에만 반영
  - 확장안: 색 mask + shade/outline overlay
  - 결정을 내리기 전 두 방식을 섞어 신규 에셋을 제작하지 않음
- [ ] 에셋 provenance 기록 방식 결정
  - 제작자, 도구/모델, 입력 권리, 프롬프트, 생성일, 승인자, 라이선스

등록 전후 명령:

```bash
npm run avatar:add -- <metadata...> --dry-run
npm run avatar:add -- <metadata...>
npm run avatar:check
```

## 전체 검증

- [ ] `docs/TEST_PLAN.md` 기준 수동 검증
- [ ] 인증: 이메일 회원가입·로그인·로그아웃·계정 전환·카카오 로그인
- [ ] 코디: 생성·전체 아이템 선택·저장·목록·상세 딥링크·즐겨찾기·삭제
- [ ] 탭: 홈·캘린더·통계·잠자는 옷장·챌린지
- [ ] 접근성: 스크린리더, 200% 글자 크기, 320pt 폭, 색 대비
- [ ] 네트워크 실패: 로딩·오류·재시도 및 다른 계정 데이터 비노출
- [ ] 앱을 자정 전부터 유지 → 자정 후/foreground 복귀 시 오늘 날짜·기록 대상 갱신
- [ ] 잠자는 옷장 "시작" → 추천 아이템이 입혀진 코디 편집기 확인
- [ ] 320pt 폭에서 홈·챌린지·잠자는 옷장 CTA가 잘리지 않는지 확인

## 빌드와 배포

- [ ] Expo 계정 로그인 및 EAS 권한 확인
- [ ] GitHub Actions secret `EXPO_TOKEN` 등록
- [ ] EAS iOS signing credentials와 App Store Connect API key 등록
- [ ] GitHub `app-store` Environment 생성 및 Required reviewer 지정
- [ ] iOS Bundle ID / Android package `com.clothic.app` 확인
- [ ] iOS·Android production build
- [ ] App Store Connect·Google Play Console 앱 생성
- [ ] 스토어 심사용 스크린샷, 설명, 개인정보 처리방침 URL 준비

## 제품 결정 필요

- [ ] 하루 한 코디인지 복수 코디인지 확정
  - 결정 전 안전 동작: 날짜별 가장 최근 실제 착장 1건만 핵심 화면·습관 지표의 대표값으로 사용
  - 기존 복수 row는 삭제·병합하지 않고 코디 목록/상세에 보존
  - 단일: `(user_id, date)` unique + upsert
  - 복수: 홈·캘린더에서 건수와 선택 UI 제공
- [ ] 기분·메모만 있는 diary와 아이템이 있는 outfit을 분리할지 결정
- [ ] 실제 사용자 옷 등록/사진 업로드는 PRD상 MVP 제외를 유지할지 결정
- [ ] 출시 전 카카오 로그인을 필수로 포함할지 결정
- [ ] 실제 D1/D7 반복 기록률을 수집할지 결정
  - v4는 합성 flow proxy이며 실제 리텐션이 아님. 새 v4 baseline은 아직 기록 전
  - v1-v3의 12/12 기록은 비재현 legacy로만 보존
  - 도입 시 analytics 이벤트·동의·보관기간·개인정보 처리방침을 함께 확정
- [ ] 알림 기능 방향 결정
  - 현재는 인앱 목록만 있고 자동 생성기·로컬 알림·푸시 발송 없음
  - 설정 화면은 오해를 막기 위해 준비 중/비활성 상태
  - 푸시는 PRD상 MVP 제외이므로 도입 시 별도 범위 승인 필요
