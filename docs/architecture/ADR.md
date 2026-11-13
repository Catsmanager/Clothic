# ADR
## ADR-001: Expo 사용
### 결정

MVP는 Expo 기반으로 개발한다.

### 이유
React Native 개발 속도가 빠르다.
초기 설정이 단순하다.
App Store 출시가 쉽다.
1인 개발 MVP에 적합하다.
### 대안
React Native CLI
Flutter
### 대안을 선택하지 않은 이유
초기 MVP에서는 개발 속도가 가장 중요하다.
React Native CLI는 설정 비용이 크고,
Flutter는 새로운 생태계를 학습해야 한다.

---

## ADR-002: Supabase 사용

### 결정
인증 및 데이터 저장을 Supabase로 처리한다.

### 이유
- PostgreSQL 기반으로 복잡한 쿼리가 가능하다.
- Row Level Security(RLS)로 사용자별 데이터 격리가 간단하다.
- 카카오 포함 소셜 OAuth를 기본 지원한다.
- Expo와 통합이 용이하다 (@supabase/supabase-js).

### 대안
Firebase, PocketBase, 자체 서버

### 대안을 선택하지 않은 이유
Firebase는 NoSQL이라 관계형 쿼리가 불편하고, RLS가 없다.
PocketBase는 셀프 호스팅이 필요해 운영 비용이 생긴다.
자체 서버는 1인 개발 MVP에 과도한 오버헤드다.

---

## ADR-003: Spring Boot 첫 배포 대상은 AWS Lightsail 서울

### 결정과 상태

2026-11-12 사용자가 AWS를 선택했다. 앞서 제안한 **Lightsail 가상 서버, 서울 `ap-northeast-2`, Linux/Unix 공개 IPv4·메모리 1GB**를 첫 배포 검증 대상으로 삼는다. 인스턴스 생성·운영 배포는 아직 실행하지 않았다. 실행 상태는 [plan.md의 R-02](../../plan.md)를 따른다.

Spring Boot만 AWS에 배치하고 Supabase Auth와 PostgreSQL은 유지한다. ADR-002의 인증·저장소 선택을 유지하면서 앱의 데이터 접근 경로를 서버로 단계적으로 옮긴다. 결정 당시에는 main의 Java 21을 기준으로 준비했다. 2026-11-13 J-01에서 서버를 Java 25로 올렸으므로 배포 런타임도 Java 25를 사용한다.

### 선택 이유와 확인 범위

- AWS에서 서버 실행·네트워크·HTTPS·관측·복귀를 직접 구성하는 방향을 택했다. 서비스 가동에 필요한 운영 작업도 직접 맡는다.
- [AWS 요금표](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html)는 해당 1GB 플랜의 월 최대 기본 요금이 7 USD임을 명시한다. 세금·초과 사용량·스냅샷·도메인 등은 별도이며 총 청구액을 보장하는 값이 아니다.
- [AWS 리전 목록](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html)에 서울이 포함된다. 실제 Supabase 프로젝트도 같은 리전임을 확인했다. 리전 일치는 실제 지연시간이나 가용성을 증명하지 않는다.
- 1GB는 첫 검증 대상이며 충분한 용량으로 입증되지 않았다. 실제 메모리·응답시간을 측정하고 부족할 때 증설을 판단한다. 2GB 플랜의 기본 요금은 월 최대 12 USD다.

### 비교한 대안

Railway는 서버 관리 부담을 줄이는 대안으로 제안했으나 사용자가 AWS를 선택했다. Render와 AWS의 다른 서버·컨테이너 제품도 대안이지만 이번에는 단일 Lightsail 가상 서버를 기준으로 준비한다. 다른 제품이 기술적으로 불가능하다는 판단은 아니다.

계정 접속, HTTPS 주소, 환경변수 전달, 배포·복귀 검증은 [운영 가이드](../operations/CICD.md#9-aws-lightsail-첫-배포-준비-r-02)에 정리한다. 공식 자료는 제품 지원·요금·설정 방법의 근거이며 Clothic의 실제 배포 성공을 입증하지 않는다.

---

## ADR-004: Supabase에서 독립해 로그인과 데이터 저장을 직접 운영한다

### 결정과 상태

2026-11-13 사용자가 결정했다. 최종 목표는 Supabase를 사용하지 않고 **로그인(회원가입·토큰 발급)과 데이터 저장(PostgreSQL)을 직접 만든 Spring Boot 서버와 직접 운영하는 서버에서 처리**하는 것이다. 백엔드를 직접 구현·운영해 보는 것이 이 프로젝트의 목적이기 때문이다.

- 기존 가입자와 데이터는 새 시스템으로 옮기지 않고 **새로 시작**한다. 실제 가입자는 있으나 사용자가 활성 사용자가 없다고 판단했다. 기존 데이터의 삭제·고지·개인정보 처리방침 갱신은 Supabase 종료 작업(plan.md S-09)에서 다룬다.
- API 주소에는 사용자가 보유한 `jinhyunji.kr`의 하위 주소를 사용한다. 2026-11-13 조회에서 `jinhyunji.kr` 자체는 이미 다른 곳을 가리키는 주소 기록이 있었으므로 그 기록은 바꾸지 않는다. 하위 주소 이름은 `clothic-api.jinhyunji.kr`을 제안하며 DNS 등록 시 확정한다.
- 아직 구현·배포하지 않았다. 실행 상태는 [plan.md](../../plan.md)의 S-01~S-09와 R-02를 따른다.

### 다른 결정과의 관계

- ADR-002(Supabase 사용)는 이 전환이 끝날 때까지의 현재 구현을 설명한다. 전환이 끝나면 이 결정으로 대체된다. 당시 대안을 선택하지 않은 이유였던 "자체 서버는 과도한 오버헤드"는 직접 운영을 학습 목표로 삼으면서 받아들이기로 했다.
- ADR-003(Lightsail 서울)은 유지한다. "Supabase Auth와 PostgreSQL은 유지한다"는 부분은 첫 배포 단계에만 해당한다.

### 진행 순서

한 번에 모두 바꾸면 실패 원인을 구분하기 어려우므로 단계를 나눈다.

1. 지금 서버를 Lightsail에 배포한다(R-02). 이 단계의 서버는 아직 Supabase에 연결한다.
2. 서버가 소유하는 DB 스키마와 자체 로그인을 구현하고 앱을 전환한다(S-01~S-06). 남은 기능 전환(F-11~F-18)도 계속한다.
3. 운영 PostgreSQL을 직접 설치·연결한다(S-07).
4. 앱의 Supabase 직접 호출을 제거하고 Supabase를 종료한다(S-08, S-09).

순서는 권장안이며, 새로 시작하므로 데이터 이전 단계는 없다.

### 받아들이는 부담

- 비밀번호 저장, 토큰 발급·갱신·폐기, Apple·Kakao 로그인 검증, 비밀번호 재설정 메일 발송을 직접 구현하고 보안 책임을 진다.
- DB 설치·백업·복원·보안 갱신을 직접 한다. Supabase의 RLS에 기대지 않으므로 사용자 격리는 서버 코드와 테스트가 전담한다.
- Spring Boot와 PostgreSQL을 한 서버에서 실행하면 1GB는 부족할 수 있다. 2GB 플랜(월 최대 12 USD)을 권장하며 인스턴스 생성 시 확정한다. 실제 메모리는 측정으로 판단한다.
- 단일 서버가 인증·데이터·API의 단일 장애점이 된다.
