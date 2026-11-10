# Clothic backend

F-01의 범위는 독립 서버 기동과 상태 확인이다. 현재 Supabase 인증·데이터베이스·앱 호출은 연결하지 않았다. 실행 목록은 먼저 루트 [plan.md](../plan.md)를 확인한다.

## 실행

Java Development Kit(JDK) 21이 필요하다. 아래 명령은 이 `backend/` 디렉터리에서 실행한다. Maven Wrapper가 Maven과 의존성을 처음 내려받을 때 네트워크 연결이 필요하다.

```bash
./mvnw spring-boot:run
```

다른 터미널에서 다음 요청을 보낸다.

```bash
curl -i http://localhost:8080/api/health
```

성공 응답은 HTTP(Hypertext Transfer Protocol) `200`, JSON(JavaScript Object Notation) `{"status":"ok"}`다. 이 응답은 웹 서버와 경로의 동작을 확인하며 데이터베이스·외부 인증 서비스의 상태까지 확인하지 않는다.

## 검증

```bash
./mvnw --batch-mode verify
```

`HealthEndpointTest`가 임의 포트에 실제 서버를 띄우고, 인증·DB 설정 없이 상태 코드·콘텐츠 타입·응답 본문을 확인한다. GitHub의 `Spring Boot · Java 21` 작업에서도 같은 명령을 실행한다. 이는 서버 검사이며 앱의 `npm run check`와 별도로 수행한다.

## 요청이 지나가는 코드

1. [ClothicBackendApplication.java](src/main/java/com/clothic/backend/ClothicBackendApplication.java)가 Spring Boot와 내장 웹 서버를 실행한다.
2. [HealthController.java](src/main/java/com/clothic/backend/health/HealthController.java)의 `@GetMapping`이 `GET /api/health`를 받는다.
3. `HealthResponse` record가 JSON 응답으로 직렬화된다.

현재 상태 확인만으로는 서비스·저장소 계층이 필요하지 않아 만들지 않았다. 다음 기능에서 인증과 데이터 접근이 필요해질 때 추가한다.

## 버전과 범위

- Java 21, Spring Boot `4.1.2`, 서버 개발 버전 `0.1.0-SNAPSHOT`을 사용한다. 앱 버전 `1.1.1`과 별도로 관리한다.
- 프로젝트 골격과 Maven Wrapper는 [Spring Initializr](https://start.spring.io/)에서 생성했다. 생성 메타데이터가 제시한 `4.1.2.RELEASE`는 실제 Maven Central에 없어, 제공되는 `4.1.2`로 부모 버전을 고정했다.
- [Boot 시스템 요구사항](https://docs.spring.io/spring-boot/system-requirements.html)은 Java 호환 범위의 근거다. 실제 실행 성공은 프로젝트 테스트·기동 결과로 별도 확인한다.
- 실제 사용자 토큰 검증, PostgreSQL 연결, 앱 조회 전환, 운영 배포는 후속 기능이다.
