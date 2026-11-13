# User Action Items

기존 목록 작성: 2026-07-27. 최신 확인일은 각 항목에 표시한다.

Codex가 코드만으로 완료할 수 없거나 사용자 계정·콘솔·디자인 승인이 필요한 작업만 정리한다.

## 바로 할 일

- [x] F-05 실제 개발 환경 연결 검증 준비 (2026-11-12 확인)
  - 계속 진행 요청에 따라 Clothic 프로젝트만 재개해 `ACTIVE_HEALTHY`와 공개 서명 키 집합(JSON Web Key Set, JWKS)의 정상 응답을 확인했다. 기존 서명 키·비밀번호·RLS 정책은 교체하지 않음
  - 실제 ES256 사용자 토큰·조회 전용 개발 역할·공식 CA를 사용하는 검증된 암호화 연결로 앱 store 실연동 검사 10개 통과. 브라우저 개발 출처는 `CLOTHIC_WEB_ALLOWED_ORIGINS`로 명시
  - 임시 계정 2개와 해당 검사 데이터 정리 후 기존 items/profiles/outfits 건수·전체 행 지문 일치 확인. 네이티브 화면과 운영 서버 배포는 별도. 근거: [실행 기록](../../LOG.md), [실검증 결과](../../.autoresearch/f05-live-verification.json)

- [x] Supabase JWT 서명 방식 확인 후 서버 환경변수 결정 (F-02 후속, 2026-11-12)
  - 사용 중인 ES256 키와 공개 JWKS 주소 확인. `CLOTHIC_AUTH_JWK_SET_URI`를 개발 실행 환경에 설정했으며 실제 두 사용자의 `GET /api/me`, `GET /api/items` 검증 통과
  - 비밀값은 무시된 `.env.local`에만 저장하며 실행 절차는 [backend/README.md](../../backend/README.md) 참조

- [ ] Kakao OAuth KOE205 해결
  - 카카오 개발자 콘솔에서 `account_email` 동의항목을 `선택 동의`로 활성화
  - 설정 후 카카오 로그인 완료 흐름 재확인
- [ ] 서버 배포(R-02) 전 확인 (2026-11-13 추가, [선행 조건](CICD.md#배포-실행-전-선행-조건))
  - (확인됨 2026-11-13) Supabase 정지 원인은 장기간 미사용 자동 정지. 독립 계획(ADR-004)에 따라 요금제는 바꾸지 않고 배포·검증 직전에 상태만 확인
  - 배포용 DB 역할 SQL 초안 검토·실행 후 권한 조회 결과 확인. 비밀번호는 서버 환경 설정에만 저장
  - (결정됨 2026-11-13) API 주소는 보유한 `jinhyunji.kr`의 하위 주소 사용. 남은 작업: 고정 IP 생성 후 도메인 관리 화면에서 하위 주소(제안 `clothic-api`)의 A 기록 등록
  - AWS 계정은 보유(2026-11-13 확인). 남은 작업: Lightsail 인스턴스 생성(2GB 권장)과 접속 확인
  - (결정됨 2026-11-13) 로그인·DB까지 직접 운영하고 기존 가입자는 옮기지 않고 새로 시작. 실행 항목은 plan.md S-01~S-09
  - Java 25 업그레이드는 사용자 결정에 따라 2026-11-13 최신 main에서 다시 검증해 반영함(plan.md J-01). 로컬 전용 브랜치 `appmod/java-upgrade-20261111071938`는 그대로 남아 있으며 정리 여부는 사용자가 결정
- [ ] Supabase 운영 DB 마이그레이션 상태 확인
  - `outfits.is_favorite`·`outfits.item_colors`: 2026-11-12 F-07·F-09 실연동에서 서버가 두 열을 조회·저장해 존재는 확인됨. 열의 not null·기본값 정의는 직접 조회하지 않음
  - repository의 fresh migration 순서(`profiles` 생성 전 alter)를 별도 이슈로 정리. 서버 테스트(F-03)는 이 문제를 피하기 위해 `backend/src/test/resources/db/00-auth-stub.sql`에서 `profiles`를 미리 만든다
- [x] 서버용 Supabase DB 접속 역할 결정 (F-03 후속, 2026-11-12)
  - 개발용 `clothic_backend_dev`: F-05에서 items/profiles 조회를 확인했고, F-06에서 items INSERT만 추가. items SELECT/INSERT 허용·UPDATE/DELETE 불허를 확인했으며 서버의 인증 사용자 조건으로 격리. 기존 RLS 정책은 변경하지 않음
  - shared session pooler(5432), `sslmode=verify-full`과 공식 루트 인증서 사용. 설정과 비밀번호는 무시된 `CLOTHIC_DB_*` 로컬 환경으로만 전달. 이후 쓰기 기능은 해당 기능에서 필요한 권한을 별도 확인
- [x] GitHub CLI 인증 확인 (2026-11-12)
  - `gh auth status` 정상. 연결 도구의 PR 생성 권한과 명령줄 인증은 별개이며 PR 작업은 사용 가능한 명령줄 경로로 진행

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

- [ ] `docs/operations/TEST_PLAN.md` 기준 수동 검증
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
