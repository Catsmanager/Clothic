# Clothic 실행 계획

이 파일을 매 작업의 첫 확인 대상으로 사용한다. 상세 학습·설계 설명은 [마이그레이션 참고 문서](docs/migration/SPRING_BOOT_MIGRATION_PLAN.md), 개발·릴리스 절차는 [운영 가이드](docs/operations/CICD.md)를 참고한다.

## 작업·완료 규칙

1. 작업 시작 시 이 파일에서 사용자 요청에 해당하는 기능, 선행 조건, 완료 기준을 확인한다.
2. 한 작업 브랜치는 아래 기능 한 가지를 완료한다. 구현·검증에 필요한 코드·테스트·문서·CI 수정은 같은 단위에 포함한다.
3. 작업할 기능의 GitHub 이슈와 원격 브랜치를 먼저 확인한 뒤 파일을 수정한다.
4. 기능 구현과 명시한 검증이 끝난 항목만 `[x]`로 바꾼다. 계획 작성·코드 생성·커밋·PR 생성만으로 체크하지 않는다.
5. 미완료·실패·외부 설정 대기는 `[ ]`로 유지하고 아래 실행 기록에 이유를 적는다. 새로 발견한 기능은 미완료 항목으로 추가한다.
6. 완료 체크와 함께 검증 명령·결과·근거 파일·PR을 기록한다. 병합 여부와 운영 배포 여부는 별도로 표시한다.
7. TODO에는 중복된 기능별 체크리스트를 만들지 않고 이 파일로 연결한다. 이 파일은 지속 갱신하며 작업마다 새 계획 파일을 만들지 않는다.

## 범위와 전제

- 2026-11-13 사용자 결정: 최종 목표는 Supabase에서 독립해 로그인과 데이터 저장을 직접 만든 서버에서 처리하는 것이다. 기존 가입자·데이터는 옮기지 않고 새로 시작한다. 근거: [ADR-004](docs/architecture/ADR.md#adr-004-supabase에서-독립해-로그인과-데이터-저장을-직접-운영한다). 독립 전환(S 항목)이 끝나기 전까지 현재 구현은 기존 Supabase Auth와 PostgreSQL을 사용한다.
- 현재 main의 카탈로그/소유 아이템 분리 구현을 보존한다. 기존 상세 문서의 73c9863 분석은 과거 기준이므로 API 연결 전 현재 타입·동작과 대조한다.
- 현재 구현 범위는 F-01~F-10의 서버 기동·인증·내 옷 조회·등록과 코디 목록·상세·저장·수정 전환, F-13 프로필 서버 경로와 P-05 디렉터리 분리다. F-11 이후 나머지 앱/API 전환은 아래 선행 조건에 따라 진행한다.
- F-05/F-06은 실제 Supabase 토큰·개발 DB와 연결한 store 조회·추가 실행 및 기존 조회 비교까지 확인했다. 운영 서버 배포와 실기기 전체 회귀는 R-02/R-04에서 별도로 확인한다.

## 준비 작업

- [x] **P-01 마이그레이션 학습·범위 계획** — 기존 흐름과 단계별 검증 기준을 문서화. 근거: [PR #176](https://github.com/Catsmanager/Clothic/pull/176).
- [x] **P-02 문서 탐색 구조** — 문서 주제별 분리와 링크 검증. 근거: [PR #179](https://github.com/Catsmanager/Clothic/pull/179).
- [x] **P-03 최소 작업별 원격 브랜치 규칙** — 작업 브랜치·원격 ref 확인 후 편집하도록 지침과 스킬 연결. 근거: [PR #180](https://github.com/Catsmanager/Clothic/pull/180).
- [x] **P-04 버전 지정 앱 릴리스 흐름** — 모든 PR CI와 버전·커밋·빌드 ID 검사 적용. 근거: [PR #182](https://github.com/Catsmanager/Clothic/pull/182). 실제 TestFlight 성공은 R-03에서 확인.

- [x] **P-05 frontend/backend 디렉터리 분리** — Expo 소스·설정·로컬 실행 환경을 frontend/로 옮기고 서버는 backend/에 둔다. CI·EAS·Vercel 경로와 현재 문서·스킬을 갱신한다. 앱 전체 검사·웹 export, 서버 Maven verify, 파일 보존·workflow·문서 링크 검사와 GitHub CI 통과로 완료한다. 선행: F-01. 운영 배포는 별도다. 추적: [#187](https://github.com/Catsmanager/Clothic/issues/187).
- [x] **P-06 legacy 평가기·flow 스크립트 분리** — v1~v5 evaluator manifest를 `HARNESS/legacy/`, v1~v3 user-flow 스크립트를 `frontend/scripts/legacy/`로 옮기고 현역 v6·v4 파일은 그대로 둔다. 참조 문서·state.json을 새 경로로 갱신하고 `npm run check` 통과로 완료한다. 추적: [#189](https://github.com/Catsmanager/Clothic/issues/189).
- [x] **P-07 홈 전용 컴포넌트 폴더 정리** — 홈 화면 전용 컴포넌트 6개를 `frontend/components/home/`, SaveOutfitSheet를 `save-outfit/`으로 옮기고 import를 갱신한다. AvatarCard는 v4 flow 검사 의존으로 제외한다. `npm run check`·웹 export 통과로 완료한다. 추적: [#190](https://github.com/Catsmanager/Clothic/issues/190).
- [x] **P-08 루트 문서 정리** — USER_ACTION_ITEMS.md를 `docs/operations/`로 옮기고 참조를 갱신하며 `.gitignore`에 `.vscode/`를 추가한다. 문서 링크 확인으로 완료한다. 추적: [#191](https://github.com/Catsmanager/Clothic/issues/191).
- [x] **P-09 PR 자동 병합 규칙** — 작업 완료 흐름을 PR 생성 → CI 통과 확인 → main 병합까지로 확장하고 CLAUDE.md·AGENTS.md·작업 스킬에 조건을 적는다. 문서 변경만이며 새 규칙으로 해당 PR을 병합해 완료한다. 추적: [#197](https://github.com/Catsmanager/Clothic/issues/197).

## 첫 옷 목록 전환

- [x] **F-01 서버 기동·상태 확인** — Java 21·Spring Boot 프로젝트가 Maven Wrapper로 실행되고, 실제 HTTP `GET /api/health`가 `200 {"status":"ok"}`를 반환한다. 서버 통합 테스트와 서버 CI가 통과한다. 인증·DB·앱 연결은 포함하지 않는다. 선행: P-01~04.
- [x] **F-02 로그인 사용자 검증** — Supabase 사용자 토큰을 서버에서 검증하고 신뢰할 수 있는 사용자 ID를 얻는다. 토큰 누락·변조·만료·잘못된 발급자·대상은 조회 전 `401`로 거부한다. 실제 프로젝트의 서명 방식도 확인한다. 선행: F-01.
- [x] **F-03 본인 아이템 데이터 조회** — 격리된 PostgreSQL에서 현재 items 스키마를 매핑하고 인증된 사용자 조건으로 조회한다. A·B 계정 격리, 빈 결과, catalog_item_id·날짜·배열 매핑과 접속 역할/RLS 동작을 검증한다. 선행: F-02.
- [x] **F-04 내 옷 목록 API** — `GET /api/items`의 응답 계약을 현재 UserItem과 대조해 확정하고, 정렬·빈 목록·허용 분류·오류 응답을 검증한다. 요청의 사용자 ID로 대상을 바꿀 수 없어야 한다. 선행: F-03.
- [x] **F-05 앱의 내 옷 조회 전환** — fetchItems가 토큰과 함께 새 API를 호출한다. 기존 카탈로그 해석·로딩·오류·재시도·계정 전환 및 늦은 응답 차단을 유지하고 기존 조회 결과와 비교한다. 선행: F-04.
- [x] **F-06 기본 옷을 내 옷장에 추가** — 사용자 확인으로 템플릿을 소유 아이템에 등록하는 서버 경로를 구현한다. 같은 사용자·템플릿 중복 방지와 기존 정적 ID/사용자 ID 호환을 검증하고 해당 앱 쓰기 경로를 연결한다. 선행: F-05.

## 나머지 기능 전환

각 항목은 해당 서버 경로와 앱 호출 경로를 연결하고, 본인 데이터 접근·실패 조건까지 검증한 뒤 완료 처리한다. 구현을 시작할 때 실제 기존 함수와 응답 계약을 다시 확인한다.

- [x] **F-07 코디 목록 조회** — 본인의 코디 목록과 정렬·빈 결과가 기존 동작과 일치한다. 선행: F-05.
- [x] **F-08 코디 상세 조회** — 본인 코디만 상세 조회하고 다른 계정·없는 ID의 처리가 명확하다. 선행: F-07.
- [x] **F-09 코디 저장** — 날짜·착장 아이템·색상·기분·메모를 본인 기록으로 저장하고 재조회한다. 유효성 검사와 중복 제출을 확인한다. 선행: F-06, F-08.
- [x] **F-10 코디 수정** — 기존 코디 필드 변경이 본인 데이터에만 적용되고 실패 시 앱 상태가 복구된다. 선행: F-09.
- [ ] **F-11 즐겨찾기 변경** — 본인 코디의 즐겨찾기를 바꾸고 빠른 연속 입력·저장 실패·재조회 결과를 검증한다. 선행: F-08.
- [ ] **F-12 코디 삭제** — 본인 코디만 삭제하고 실패·재조회·연관 화면 갱신을 검증한다. 저장 재시도와 삭제의 경합으로 기록이 되살아나지 않는지도 확인한다. 선행: F-08.
- [x] **F-13 프로필 조회·변경** — 본인 프로필만 조회·수정하고 재로그인 후에도 복원된다. 선행: F-02.
- [ ] **F-14 알림 설정 변경** — 본인 알림 설정 조회·변경이 재로그인 후에도 유지되고 실패 시 복구된다. 선행: F-13.
- [ ] **F-15 알림 목록 조회** — 본인 알림만 읽고 정렬·빈 결과·조회 실패를 구분한다. 선행: F-02.
- [ ] **F-16 알림 읽음 처리** — 개별·전체 읽음 처리가 본인 알림에만 적용되며 실패 시 상태가 복원된다. 선행: F-15.
- [ ] **F-17 알림 삭제** — 본인 알림만 삭제하고 목록·미읽음 상태를 갱신한다. 선행: F-15.
- [ ] **F-18 계정 삭제** — 본인 재인증·데이터 정리·세션 종료를 기존 계약과 대조한다. 격리된 테스트 계정에서 성공·실패·다른 사용자 보존을 검증한 뒤 운영 적용을 판단한다. 선행: F-06~17.

## Supabase 독립 전환

[ADR-004](docs/architecture/ADR.md#adr-004-supabase에서-독립해-로그인과-데이터-저장을-직접-운영한다)의 실행 항목이다. 각 항목은 착수할 때 현재 앱 동작(`frontend/stores/authStore.ts` 등)과 대조해 범위를 다시 확인한다. 새 의존성·외부 서비스가 필요한 선택은 착수 전에 제안하고 승인받는다.

- [ ] **S-01 서버 소유 DB 스키마** — 사용자·프로필·아이템·코디·알림 테이블을 Supabase의 `auth.users`·`auth.uid()`·RLS에 의존하지 않는 스키마로 정의하고, 빈 PostgreSQL에 순서대로 적용되는 이력으로 관리한다(관리 도구는 착수 시 제안). 빈 DB 적용과 서버 테스트 전체 통과로 완료한다.
- [ ] **S-02 이메일 회원가입·로그인·토큰** — 서버가 비밀번호를 안전한 해시로 저장하고 접근·갱신 토큰을 발급·갱신·폐기한다. 보호 경로는 서버가 발급한 토큰만 받는다. 잘못된 자격·만료·폐기·중복 가입·다른 사용자 격리를 검증한다. 선행: S-01.
- [ ] **S-03 앱의 이메일 인증 전환** — 가입·로그인·세션 복원·토큰 갱신·로그아웃·계정 전환이 서버 인증으로 동작하고 세션은 expo-secure-store에 둔다. 만료·오프라인·서버 오류에서 로딩이 끝나고 이전 사용자 데이터가 보이지 않아야 한다. 선행: S-02.
- [ ] **S-04 비밀번호 재설정·변경** — 현재 앱이 제공하는 재설정 메일과 비밀번호 변경을 서버로 옮긴다. 메일 발송 수단(외부 서비스·비용)을 먼저 결정한다. 선행: S-02.
- [ ] **S-05 Apple 로그인** — 서버가 Apple ID 토큰을 검증해 계정을 만들거나 연결한다. 실기기에서 확인한다. 선행: S-02.
- [ ] **S-06 Kakao 로그인** — 서버가 Kakao 인증 결과를 검증해 계정을 만들거나 연결한다. 출시 포함 여부는 기존 제품 결정 항목을 따른다. 선행: S-02.
- [ ] **S-07 운영 PostgreSQL 직접 운영** — 배포 서버에 PostgreSQL을 설치하고 외부에 공개하지 않은 채 서버와 연결한다. 전용 접속 계정, 자동 백업, 실제 복원 연습, 재부팅 후 복구를 검증한다. 선행: R-02, S-01.
- [ ] **S-08 앱의 Supabase 직접 호출 제거** — 앱에 남은 Supabase 호출과 직접 조회 경로, 관련 환경변수·의존성을 제거하고 "Supabase 사용" 지침을 CLAUDE.md·AGENTS.md 양쪽에서 갱신한다. 선행: F-11~F-18, S-03~S-06.
- [ ] **S-09 Supabase 종료와 기존 가입자 처리** — 기존 가입자 데이터의 삭제 방법·고지와 개인정보 처리방침 갱신을 정하고, 새 앱 버전 공개를 확인한 뒤 프로젝트를 종료한다. 삭제·종료는 되돌릴 수 없으므로 사용자가 직접 실행한다. 선행: S-07, S-08, R-03.

## 운영 전환과 기존 문제

- [ ] **R-01 main 병합 보호** — 사용자 운영 방식에 맞는 PR·필수 검사 규칙을 실제 설정하고 강제 여부를 확인한다.
- [ ] **R-02 서버 배포·복귀** — AWS Lightsail 서울의 Linux/Unix 공개 IPv4·1GB 가상 서버를 첫 검증 대상으로 선택했다. 이 첫 배포 단계의 서버는 기존 Supabase Auth·DB에 연결하며 독립 전환은 S 항목에서 진행한다. API 주소는 보유 도메인의 하위 주소(제안: `clothic-api.jinhyunji.kr`)를 사용한다. 별도 서버 버전과 환경변수·HTTPS·상태 확인·오류 관측·복귀 절차를 구성하고 배포 환경에서 검증한다. 현재는 계정 접속·HTTPS 주소 확인과 실제 배포/복귀 검증이 남아 있다. 배포 실행 전 확인할 조건: ① 배포 서버 런타임을 main과 같은 Java 25로 설치·확인 ② Supabase 프로젝트가 정지 상태가 아닌지 배포 직전 확인(정지 원인은 장기간 미사용 자동 정지로 확인) ③ 개발 역할과 분리한 배포용 DB 역할을 검토한 SQL로 만들고 권한을 조회로 확인 ④ 하위 주소의 DNS 등록과 인증서 발급 ⑤ 서버 장애 시 앱 복귀 기준 결정. 선행: F-04. 준비 추적: [#223](https://github.com/Catsmanager/Clothic/issues/223)·[#225](https://github.com/Catsmanager/Clothic/issues/225), [선행 조건](docs/operations/CICD.md#배포-실행-전-선행-조건), [결정 근거](docs/architecture/ADR.md#adr-003-spring-boot-첫-배포-대상은-aws-lightsail-서울)·[배포 절차](docs/operations/CICD.md#9-aws-lightsail-첫-배포-준비-r-02).
- [x] **J-01 Java 25 런타임 업그레이드** — backend의 컴파일 대상·서버 CI·현재 실행/배포 문서를 Java 25로 올렸다. 최신 main 기준 Java 21 baseline과 Java 25에서 서버 테스트 77개가 모두 통과했고 GitHub 서버 CI도 Java 25로 실행한다. 과거 Java 21 검증 기록은 이력으로 둔다. 배포 서버의 런타임 설치·확인은 R-02에서 한다. 추적: [#227](https://github.com/Catsmanager/Clothic/issues/227).
- [ ] **R-03 앱 릴리스 검증** — app-store 승인/태그 정책, 지정 버전 빌드와 TestFlight 처리, 실제 공개 버전 대조를 확인한다. 코드·설정 작성만으로 체크하지 않는다.
- [ ] **R-04 전체 사용자 흐름 회귀** — 가입·로그인·옷장·코디·캘린더·통계·접근성·계정 전환을 실기기에서 확인하고 전환 전후 데이터 보존을 검증한다. 선행: 필요한 F 항목과 R-02.
- [ ] **B-01 공개 정책 문서 복구** — 원문과 공개 주소를 대조하고 비로그인·모바일에서 본문을 확인한다. 추적: [#168](https://github.com/Catsmanager/Clothic/issues/168).
- [ ] **B-02 앱 진입 무한 로딩 복구** — 발생 환경에서 재현·원인 수정 후 정상 세션·만료·오프라인·서버 오류 모두 로딩이 종료되는지 검증한다. 추적: [#174](https://github.com/Catsmanager/Clothic/issues/174).

## 실행 기록

| 기능 | 구현·검증 | GitHub 통합 | 운영 배포 |
| --- | --- | --- | --- |
| P-01 | 계획 문서 확인 | #176 병합 | 해당 없음 |
| P-02 | 문서 이동·링크 검사 | #179 병합 | 해당 없음 |
| P-03 | 기존 작업 스킬 검증 | #180 병합 | 해당 없음 |
| P-04 | 로컬 검사·기존 PR CI 통과 | #182 병합 | 실제 앱 빌드·제출 미검증 |
| P-05 | 로컬 앱 전체 검사·핵심 테스트 28개·하네스 6개, 웹 export, Maven verify, 파일 보존·문서 링크 75개·workflow·스킬 검사 통과; GitHub CI 42781302107 앱·서버 통과(6d7b78d) | [PR #188](https://github.com/Catsmanager/Clothic/pull/188) (검증 완료, 통합 상태는 PR 참조) | 미배포 |
| P-06 | legacy 파일 이동 후 `npm run check` 통과(핵심 28개·소유 계약 8/8·하네스 6개), legacy v3 스크립트 단독 실행 확인(FLOW_SCORE 11/12), 현역 v6 manifest fixtureFiles 불변 | [PR #192](https://github.com/Catsmanager/Clothic/pull/192) 병합(76350f6) | 해당 없음 |
| P-07 | 컴포넌트 7개 이동 후 `npm run check` 통과(typecheck·lint·format·핵심 28개·소유 계약 8/8·하네스 6개), 웹 export 성공 | [PR #193](https://github.com/Catsmanager/Clothic/pull/193) 병합(f3991f2) | 해당 없음 |
| P-08 | 파일 이동·참조 2곳 갱신, 로컬 문서 링크 검사 통과, `git check-ignore .vscode` 확인. 코드 변경 없음 | [PR #194](https://github.com/Catsmanager/Clothic/pull/194) 병합(bc9c347) | 해당 없음 |
| P-09 | 규칙 문서 3개 갱신, 코드 변경 없음 | [PR #198](https://github.com/Catsmanager/Clothic/pull/198) | 해당 없음 |
| R-02 준비 | 사용자 AWS 선택을 반영해 Lightsail 서울·1GB와 기존 Supabase 유지, 비용 경계·환경변수·HTTPS·관측·버전 복귀 검증 절차를 문서화. 코드 변경 없음. 실제 계정 접속·배포·복귀는 미검증이므로 미완료 유지 | 이슈 [#223](https://github.com/Catsmanager/Clothic/issues/223) | 미배포 |
| 독립 결정 | 2026-11-13 사용자 결정(자체 로그인·자체 PostgreSQL, 새로 시작, `jinhyunji.kr` 하위 주소 사용)을 ADR-004와 S-01~S-09로 반영. 문서 변경만이며 구현·배포·Supabase 변경 없음 | 이슈 [#229](https://github.com/Catsmanager/Clothic/issues/229) | 미배포 |
| J-01 | 최신 main(685de24)에 Java 25 변경을 다시 적용. `./mvnw --batch-mode clean verify`: Java 21.0.13 baseline 77/77, Java 25.0.2 77/77 통과. 이전 로컬 전용 브랜치의 32개 시점 검증·커버리지·CVE 기록은 이번 검증에 포함하지 않음. 배포 서버 런타임은 미확인 | 이슈 [#227](https://github.com/Catsmanager/Clothic/issues/227) | 미배포 |
| R-02 선행 조건 | 2026-11-13 배포·DB 계획 점검 결과를 반영. Java 21 고정, Supabase 정지 확인, 배포용 역할 SQL 초안(미실행), HTTPS 주소 권장, 메모리 상한, 앱 복귀 기준을 문서화하고 J-01을 미완료 항목으로 등록. 읽기 전용 확인: Clothic 프로젝트 `ACTIVE_HEALTHY`(요금제·정지 원인은 미확인). 코드 변경 없음. 역할 생성·배포는 미실행 | 이슈 [#225](https://github.com/Catsmanager/Clothic/issues/225) | 미배포 |
| F-13 | 서버 범위 완료. Maven verify 32개 통과(프로필 5개 추가): 가입 트리거로 생긴 행 조회, 변경 후 재조회 복원, 부분 변경 시 나머지 유지, 다른 사용자 불변, 빈/미지 키(id·username)/비불리언/비JSON 400, 401, 행 없음 404(생성 안 함). 앱의 설정 화면 전환과 재로그인 복원 확인은 F-14 | [PR #208](https://github.com/Catsmanager/Clothic/pull/208) | 미배포 |
| F-10 | PATCH /api/outfits/{id}와 기분·메모 편집 연결. 제공/미제공/null, 본인/타인·없는 행·입력/인증 오류, 다른 필드 보존 확인. 연속 부분 수정·후속 실패·최신 재조회/상세/삭제 복원 보호. 앱 핵심 96개·흐름 8/8·하네스 6개, 서버 77개·실환경 24개 통과. 임시 계정 정리 후 기존 데이터 건수·전체 행 지문 일치. 근거: `.autoresearch/f10-live-verification.json` | [PR #221](https://github.com/Catsmanager/Clothic/pull/221), 이슈 #220 | 미배포 |
| F-09 | POST /api/outfits와 앱 저장 연결. 요청 UUID의 최초 201·중복 200·다른 내용 409, 동시 4건 한 행·동일 날짜 별도 저장·입력/본인 아이템 검증·재조회 확인. 앱 핵심 82개·흐름 8/8·하네스 6개, 서버 70개·실환경 18개 통과. 임시 계정 정리 후 기존 데이터 건수·전체 행 지문 일치. 근거: `.autoresearch/f09-live-verification.json` | [PR #219](https://github.com/Catsmanager/Clothic/pull/219), 이슈 #218 | 미배포 |
| F-08 | GET /api/outfits/{id}와 앱 상세 복원 연결. 본인·타인/없는 ID·잘못된 ID·인증·DB 실패 구분. 빈 store 복원, 늦은 목록/삭제/계정 전환 보호, 대문자 UUID 정규화 확인. 앱 핵심 71개·흐름 8/8·하네스 6개, 서버 61개·실환경 14개 통과. 임시 계정 정리 후 기존 데이터 건수·전체 행 지문 일치. 근거: `.autoresearch/f08-live-verification.json` | [PR #217](https://github.com/Catsmanager/Clothic/pull/217), 이슈 #216 | 미배포 |
| F-07 | GET /api/outfits와 앱 fetchOutfits 연결. 날짜·생성일 내림차순, 모든 Outfit 필드·정적/소유/과거 ID·색상·빈 결과·사용자 격리 확인. 앱 핵심 62개·흐름 8/8·하네스 6개, 서버 55개·실환경 9개 통과. 임시 계정 정리 후 기존 items/profiles/outfits 건수·전체 행 지문 일치. 근거: `.autoresearch/f07-live-verification.json` | [PR #215](https://github.com/Catsmanager/Clothic/pull/215), 이슈 #214 | 미배포 |
| F-06 | POST /api/items는 토큰 사용자와 서버 카탈로그만 사용. 최초/중복·동시 요청 한 행·다른 사용자 격리·임의 필드 거부·기존 ID 호환 확인. 앱 추가 경로·계정 전환·늦은 목록 회귀 수정. 앱 핵심 49개·흐름 8/8·하네스 6개, 서버 48개·실환경 13개 통과. 임시 계정 2개 정리 후 기존 items/profiles/outfits 건수·전체 행 지문 일치. 근거: `.autoresearch/f06-live-verification.json` | [PR #213](https://github.com/Catsmanager/Clothic/pull/213), 이슈 #212 | 미배포 |
| F-05 | 2026-11-12 실제 Supabase ES256 토큰·조회 전용 개발 역할·공식 CA를 사용하는 session pooler 연결 확인. 기존/새 조회 일치, 두 사용자 격리·계정 전환·로그아웃·늦은 응답·오류/재시도·출처 사전 요청 등 실연동 검사 10개 통과. 임시 계정 2개 정리 후 기존 items/profiles/outfits 건수·전체 행 지문 일치. 앱 핵심 42개·흐름 8/8·하네스 6개, 서버 39개 통과. 네이티브 화면·운영 배포는 별도. 근거: `.autoresearch/f05-live-verification.json`, LOG.md | [PR #211](https://github.com/Catsmanager/Clothic/pull/211) (실제 연결 검증), 이전 #206·#209·#210 병합 | 미배포 |
| F-04 | Maven verify 통과: 테스트 27개(HTTP API 7개 추가). HS256 토큰+임베디드 PostgreSQL로 200 목록(최신순, hat 카테고리 제외, 비허용 태그 제거, 필드 이름·순서 UserItem 일치), 빈 목록 [], 토큰 없음·위조 401, userId/user_id 파라미터 400(대상 불변), sub 비UUID 401, DB 실패 500(SQL·계정 미노출) | [PR #204](https://github.com/Catsmanager/Clothic/pull/204) | 미배포 |
| F-03 | Maven verify 통과: 테스트 20개(DB 5개 추가). 임베디드 PostgreSQL 17.11에 저장소 migration 적용, ddl-auto=validate 매핑 검증(열 이름을 틀리게 바꾸면 실패하는지 known-fail 확인), A·B 격리·빈 결과·catalog_item_id·text[]·timestamptz·정렬, RLS: 비우회 역할+JWT 없음 0행 / sub 설정 시 본인 행. 2026-11-12 실제 개발 역할·조회 권한과 session pooler의 검증된 암호화 연결 확인(F-05 실연동 기록) | [PR #202](https://github.com/Catsmanager/Clothic/pull/202) | 미배포 |
| F-02 | Maven verify 통과: 통합 테스트 15개(인증 14개 + health 1개). HS256·ES256(로컬 JWKS) 유효 토큰 200, 누락·다른 키·변조·만료·발급자·대상·sub 없음 401, 미설정 시 fail-closed. 2026-11-12 실제 프로젝트의 ES256 사용·두 임시 사용자의 실토큰 검증 확인(F-05 실연동 기록) | [PR #200](https://github.com/Catsmanager/Clothic/pull/200) | 미배포 |
| F-01 | Maven verify·실제 HTTP 통합 테스트 1개·패키징 jar HTTP 200 확인, GitHub 앱·서버 CI 통과(a3bdc57) | [PR #186](https://github.com/Catsmanager/Clothic/pull/186) 병합(2b36d0d) | 미배포 |

업데이트 시각과 검증 결과는 해당 작업의 [LOG.md](LOG.md)에도 남긴다. 전체 마이그레이션 추적 이슈는 [#175](https://github.com/Catsmanager/Clothic/issues/175)다.
