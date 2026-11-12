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

Spring Boot만 AWS에 배치하고 Supabase Auth와 PostgreSQL은 유지한다. ADR-002의 인증·저장소 선택을 유지하면서 앱의 데이터 접근 경로를 서버로 단계적으로 옮긴다. 현재 main의 Java 21을 기준으로 준비하며, 별도 Java 업그레이드 작업은 포함하지 않는다.

### 선택 이유와 확인 범위

- AWS에서 서버 실행·네트워크·HTTPS·관측·복귀를 직접 구성하는 방향을 택했다. 서비스 가동에 필요한 운영 작업도 직접 맡는다.
- [AWS 요금표](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html)는 해당 1GB 플랜의 월 최대 기본 요금이 7 USD임을 명시한다. 세금·초과 사용량·스냅샷·도메인 등은 별도이며 총 청구액을 보장하는 값이 아니다.
- [AWS 리전 목록](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html)에 서울이 포함된다. 실제 Supabase 프로젝트도 같은 리전임을 확인했다. 리전 일치는 실제 지연시간이나 가용성을 증명하지 않는다.
- 1GB는 첫 검증 대상이며 충분한 용량으로 입증되지 않았다. 실제 메모리·응답시간을 측정하고 부족할 때 증설을 판단한다. 2GB 플랜의 기본 요금은 월 최대 12 USD다.

### 비교한 대안

Railway는 서버 관리 부담을 줄이는 대안으로 제안했으나 사용자가 AWS를 선택했다. Render와 AWS의 다른 서버·컨테이너 제품도 대안이지만 이번에는 단일 Lightsail 가상 서버를 기준으로 준비한다. 다른 제품이 기술적으로 불가능하다는 판단은 아니다.

계정 접속, HTTPS 주소, 환경변수 전달, 배포·복귀 검증은 [운영 가이드](../operations/CICD.md#9-aws-lightsail-첫-배포-준비-r-02)에 정리한다. 공식 자료는 제품 지원·요금·설정 방법의 근거이며 Clothic의 실제 배포 성공을 입증하지 않는다.
