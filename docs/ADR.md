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