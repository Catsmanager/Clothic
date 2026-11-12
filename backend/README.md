# Clothic backend

현재 범위는 서버 기동·상태 확인(F-01), Supabase 사용자 토큰 검증(F-02), 본인 아이템 조회 저장소(F-03), 내 옷 조회·등록 API(F-04/F-06), 코디 목록·상세·저장·기분/메모 수정 API(F-07~F-10), 본인 프로필 조회·변경 API(F-13)다. F-05는 실제 Supabase 토큰·개발 DB와 연결한 앱 store 실행 검증까지 완료했다. 실기기 화면·운영 서버 배포는 별도다. 실행 목록은 먼저 루트 [plan.md](../plan.md)를 확인한다.

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

### 로컬 연결 설정으로 실행

`.env.example`을 참고해 이 디렉터리의 `.env.local`에 서버 설정을 넣고 다음 명령을 실행한다. 스크립트는 파일을 셸 코드로 실행하지 않고 환경변수로만 읽는다. 이미 지정한 프로세스 환경변수가 우선하며 값은 출력하지 않는다. 기본 수신 주소는 개발 컴퓨터의 `127.0.0.1:18080`이다.

```bash
python3 scripts/run-local.py
curl http://127.0.0.1:18080/api/health
```

Supabase shared session pooler를 사용하는 경우 Connect 화면이나 관리 API로 확인한 호스트·5432 포트와 `<역할>.<project-ref>` 사용자명을 사용한다. `sslmode=verify-full`과 공식 루트 인증서의 절대 경로를 `sslrootcert`에 함께 지정한다. 인증서는 `.local/`에 두며 `.env.local`과 함께 Git에서 제외한다. [공식 연결 문서](https://supabase.com/docs/guides/database/connecting-to-postgres)는 연결 방식·인증서 설정의 근거이며 실제 프로젝트 연결 성공은 아래 검증 기록으로 별도 확인했다.

2026-11-12 확인한 `clothic_backend_dev` 역할은 관리자·역할 생성 권한 없이 `public.items`의 SELECT/INSERT와 `public.profiles`의 SELECT와 `public.outfits`의 SELECT/INSERT를 허용한다. F-09에서 outfits INSERT, F-10에서 mood/memo 열 UPDATE를 추가했다. 전체 열 UPDATE·소유자/날짜/즐겨찾기 변경·DELETE는 허용하지 않았다. F-07에서 outfits SELECT만 추가했고 해당 테이블의 쓰기는 허용하지 않았다. F-06에서 items INSERT만 추가했고 items UPDATE/DELETE는 허용하지 않았다. 행 수준 보안(Row Level Security, RLS)을 우회하므로 서버의 인증 사용자 조건이 데이터 격리를 담당한다. 프로필 변경 등 다른 쓰기 전환은 해당 기능에서 별도 권한 확인이 필요하다.

브라우저에서 호출하려면 `CLOTHIC_WEB_ALLOWED_ORIGINS`에 정확한 개발 출처를 쉼표로 구분해 넣는다(예: `http://localhost:8081,http://127.0.0.1:8081`). 출처 설정이 비어 있으면 교차 출처 요청을 거부하며, 허용한 브라우저에서도 실제 API 요청의 토큰 검증은 유지한다. 와일드카드·경로·사용자 정보가 포함된 값은 기동 시 거부한다. [Spring Security 문서](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)는 사전 요청을 인증보다 먼저 처리하는 구성의 근거이며 허용·거부 동작은 통합 테스트와 실제 HTTP 요청으로 확인했다.

## 검증

```bash
./mvnw --batch-mode verify
```

`HealthEndpointTest`가 임의 포트에 실제 서버를 띄우고, 인증·DB 설정 없이 상태 코드·콘텐츠 타입·응답 본문을 확인한다. `auth` 패키지의 테스트는 테스트가 만든 HS256 비밀키와 ES256 키(로컬 JWKS 서버)로 유효 토큰 `200`, 토큰 누락·다른 키·변조·만료·발급자·대상 불일치·`sub` 없음 `401`, 설정 없을 때 fail-closed를 확인한다. GitHub의 `Spring Boot · Java 21` 작업에서도 같은 명령을 실행한다. 이는 서버 검사이며 앱의 `npm run check`와 별도로 수행한다.

## 사용자 토큰 검증 (F-02)

`/api/health`를 제외한 `/api/**`는 `Authorization: Bearer <Supabase 접근 토큰>`이 필요하다. 서버는 서명·만료·발급자(`iss`)·대상(`aud`)·사용자 식별값(`sub`)을 모두 검증한 뒤에만 요청을 처리한다. `GET /api/me`는 검증된 `sub`를 `{"userId":"..."}`로 돌려주며, 후속 조회 기능은 이 값으로 본인 데이터만 다룬다.

설정은 환경변수로 넘긴다. 비밀키 원문은 저장소·문서·로그에 적지 않는다.

| 환경변수 | 값 | 비고 |
| --- | --- | --- |
| `CLOTHIC_AUTH_ISSUER` | `https://<project-ref>.supabase.co/auth/v1` | 필수 |
| `CLOTHIC_AUTH_AUDIENCE` | 기본값 `authenticated` | 보통 변경하지 않음 |
| `CLOTHIC_AUTH_JWK_SET_URI` | `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` | 비대칭 키(ES256/RS256) 프로젝트 |
| `CLOTHIC_AUTH_HMAC_SECRET` | 대시보드의 JWT Secret | 레거시 대칭 키(HS256) 프로젝트 |

JWK Set URI와 HMAC Secret은 둘 중 하나만 설정한다. 둘 다 비어 있으면 서버는 상태 확인만 응답하고 보호 경로는 모든 토큰을 `401`로 거부한다(fail-closed). 어느 방식을 쓸지는 Supabase 대시보드 Project Settings → JWT Keys에서 현재 서명 키 종류를 확인해 정한다. 2026-11-12에는 실제 프로젝트의 사용 중인 키가 ES256임을 확인하고, 임시 검증 계정 두 개의 실제 토큰으로 `/api/me`, `/api/items`를 검증했다.

```bash
CLOTHIC_AUTH_ISSUER=https://<project-ref>.supabase.co/auth/v1 \
CLOTHIC_AUTH_JWK_SET_URI=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json \
./mvnw spring-boot:run
curl -i -H "Authorization: Bearer <앱에서 얻은 접근 토큰>" http://localhost:8080/api/me
```

## 데이터베이스 연결과 본인 아이템 조회 (F-03)

`item` 패키지는 기존 `public.items` 테이블을 읽기 전용으로 매핑한다. 조회는 항상 `where user_id = <검증된 사용자 ID> order by created_at desc`이며, 전체 조회 후 메모리에서 거르는 경로는 없다. 서버는 테이블을 만들거나 바꾸지 않는다(`ddl-auto=none`).

| 환경변수 | 값 | 비고 |
| --- | --- | --- |
| `CLOTHIC_DB_URL` | `jdbc:postgresql://<host>:<port>/<db>` | 미설정 시 기동은 되지만 조회 시점에 실패 |
| `CLOTHIC_DB_USERNAME` | 백엔드 전용 역할 | 관리자 계정을 쓰지 않는다 |
| `CLOTHIC_DB_PASSWORD` | 비밀번호 | 저장소에 넣지 않는다 |
| `CLOTHIC_DB_POOL_SIZE` | 기본 5 | |

**접속 역할과 RLS에 대해 확인한 사실**: 일반 JDBC 연결에는 Supabase의 `auth.uid()` 문맥이 없다. RLS를 우회하지 못하는 역할로 접속하면 `own items` 정책 때문에 조회 결과가 0행이 된다(격리된 테스트 DB에서 확인). 현재 구현은 `bypassrls` 역할과 서버의 `user_id` 조건을 함께 사용한다. 2026-11-12에는 실제 개발용 `clothic_backend_dev`의 로그인·RLS 우회·items 조회 허용·items 추가 불허를 직접 연결로 확인하고, 같은 역할을 사용한 실제 두 사용자 조회가 격리되는지 확인했다.

### 격리된 테스트 데이터베이스

로컬에 `psql`·Docker가 없어 테스트는 임베디드 PostgreSQL 17([zonky embedded-postgres](https://github.com/zonkyio/embedded-postgres))을 임의 포트로 띄운다. 운영 Supabase와 같은 major 버전이며 운영 DB에는 연결하지 않는다. 테스트는 다음 순서로 스키마를 만든다.

1. `src/test/resources/db/00-auth-stub.sql`: Supabase가 제공하는 `auth.users`·`auth.uid()`와 테스트 역할의 최소 대체물. 운영 이력상 migration 이전부터 있던 `profiles`도 미리 만든다(저장소 migration은 빈 DB에서 순서대로 적용되지 않는다).
2. 루트 `supabase/migrations/*.sql`을 파일명 순서로 그대로 적용한다. 그래서 RLS 정책·인덱스·`catalog_item_id`가 실제와 같다.
3. `99-grants.sql`: 백엔드 역할에 기능별 권한(items 조회·등록, outfits 조회, profiles 조회·변경)을 준다. 이 권한은 격리된 테스트 전용이며 실제 개발 역할과 구분한다.

`ItemQueryServiceTest`는 `ddl-auto=validate`로 엔티티 매핑이 실제 스키마와 일치하는지 확인하고, A·B 계정 격리, 빈 결과, `catalog_item_id`·`text[]`·`timestamptz` 매핑, 정렬, RLS 동작(JWT 문맥 없음 → 0행, `request.jwt.claim.sub` 설정 → 본인 행)을 검증한다.

## 내 옷 목록 API (F-04)

```http
GET /api/items
Authorization: Bearer <Supabase 사용자 접근 토큰>
```

- 사용자는 토큰의 `sub`로만 정한다. `userId`·`user_id` 쿼리 파라미터가 있으면 `400`이며 조회 대상은 바뀌지 않는다.
- 응답은 앱 `UserItem[]`과 같은 필드·순서의 배열이다: `id`, `userId`, `catalogItemId`, `name`, `category`, `imagePath`, `color`, `styleTags`, `createdAt`(시간대 포함 ISO-8601). 아이템이 없으면 `[]`.
- 앱 `mapRow()`와 같은 규칙으로 허용 카테고리 7종 외 행은 제외하고 허용 스타일 태그 10종 외 값은 제거한다. 허용값 목록은 `ItemContract`에 있으며 앱 `constants/items.ts`와 같아야 한다.
- 토큰 없음·무효 `401`, `sub`가 UUID가 아니면 `401`, DB 조회 실패 `500`(SQL·접속 정보 없음).

## 기본 옷을 내 옷장에 추가 (F-06)

```http
POST /api/items
Authorization: Bearer <Supabase 사용자 접근 토큰>
Content-Type: application/json

{"catalogItemId":"top_001"}
```

서버는 요청의 사용자 ID·이름·색상 등 메타데이터를 받지 않는다. 토큰 사용자와 서버 카탈로그로 저장할 값을 결정한다. 처음 등록하면 `201`, 같은 사용자에게 이미 등록돼 있으면 기존 행을 바꾸지 않고 `200`과 같은 소유 ID를 반환한다. 응답은 GET과 같은 `UserItem` 필드다. 현재 부분 고유 인덱스와 `ON CONFLICT DO NOTHING`으로 동시 요청도 한 행만 만들며 기존 `catalog_item_id`가 없는 행은 변경하지 않는다. 다른 사용자도 같은 기본 옷을 각자의 UUID로 소유할 수 있다.

없는 카탈로그 ID·추가 필드·잘못된 JSON·사용자 지정 쿼리는 `400`, 토큰 누락/변조·비UUID 주체는 `401`이다. 서버에 이미 있는 행이 앱에서 해석할 수 없는 분류라면 덮어쓰지 않고 `409`, 데이터베이스 실패는 상세 접속 정보 없는 `500`으로 끝난다.

등록 메타데이터는 `src/main/resources/catalog-items.json`에서 읽는다. 앱 카탈로그를 바꿨을 때 `frontend/`에서 `node --import tsx scripts/export-server-catalog.mjs --write`로 갱신한다. 앱 핵심 검사에서 원본 카탈로그와 메타데이터가 같은지 확인하므로 서로 다른 상태로 통합할 수 없다. 기본 옷 개수와 실제 실연동 결과는 [.autoresearch/f06-live-verification.json](../.autoresearch/f06-live-verification.json)에 기록했다.

## 코디 목록 API (F-07)

```http
GET /api/outfits
Authorization: Bearer <Supabase 사용자 접근 토큰>
```

`OutfitController` → `OutfitQueryService` → `OutfitRepository`가 검증된 토큰 사용자 조건으로 `public.outfits`를 조회한다. 기존 조회와 같은 `date DESC, created_at DESC`이며 둘 다 같을 때만 `id ASC`로 순서를 고정한다. 응답은 앱 `Outfit[]`의 `id`, `userId`, `date`, `mood`, `weather`, `memo`, `itemIds`, `itemColors`, `isFavorite`, `createdAt`이며 없으면 `[]`다. 과거 카탈로그 ID·소유 UUID·이미 없어진 과거 ID와 색상은 제거하거나 변환하지 않는다. 날짜는 달력 날짜로, 생성시각은 시간대와 마이크로초를 유지해 반환한다.

토큰 누락·변조·비UUID 주체는 `401`, 사용자 지정 쿼리(`userId`/`user_id`)는 `400`, 조회 실패는 접속 정보 없는 `500`이다. F-07 검증 당시에는 개발 역할에 outfits 조회만 허용했고 F-09에서 INSERT를 추가했다. 서버 주소를 설정한 앱은 `fetchOutfits`에서 세션 토큰과 이 경로를 사용하며 실패 시 직접 조회로 자동 우회하지 않는다. 주소가 비어 있으면 기존 Supabase 경로를 유지한다. 목록을 반영할 때 기존 저장·즐겨찾기·삭제 보호와 늦은 응답 차단을 유지한다.

앱 검사 62개·서버 검사 55개와 실제 임시 계정 두 개의 연동 검사 9개를 통과했다. 날짜/생성일 정렬·전체 필드의 기존/새 조회 일치, 사용자 격리·계정 전환·로그아웃·오류/재시도를 확인했다. 임시 데이터 정리 후 기존 items/profiles/outfits 전체 행 지문이 일치했다. 실행 방법은 `frontend/`에서 다음과 같다. 비밀 파일에는 이 실행에서 생성한 두 임시 계정만 들어가야 하며, 검증 후 계정 정리와 데이터 보존 대조는 별도로 수행한다.

```bash
node --import tsx scripts/verify-live-outfits.mjs --credentials <private-test-credentials.json> --api-url http://127.0.0.1:18080 --allow-test-writes true --report <report.json>
```

이 스크립트는 표식·예약 이메일·로그인 주체를 확인한 임시 계정에만 데이터를 추가한다. 응답 지연과 HTTP 500은 검증용 주입이다. 네이티브 화면·실기기·운영 배포는 포함하지 않는다. 근거: [.autoresearch/f07-live-verification.json](../.autoresearch/f07-live-verification.json).

## 코디 상세 API (F-08)

```http
GET /api/outfits/{outfitId}
Authorization: Bearer <Supabase 사용자 접근 토큰>
```

코디 ID와 인증 사용자를 함께 조건으로 조회하고 목록과 같은 `Outfit` 한 건을 반환한다. 본인 기록 `200`, 다른 사용자 기록과 없는 ID는 모두 `404`, UUID 형식이 아닌 ID `400`, 사용자 지정 쿼리 `400`, 누락·변조·잘못된 인증 주체 `401`, 데이터베이스 실패 `500`이다. 오류 본문에는 다른 사용자의 기록이나 SQL·접속 정보를 넣지 않는다. 새 쓰기 권한이나 스키마 변경은 없다.

앱의 상세 딥링크·새로고침은 `fetchOutfitById`에서 설정된 서버로 복원한다. `404`는 `found: false, error: null`이고 서버 실패는 `found: false`와 재시도 오류다. 주소 미설정 시 기존 직접 조회를 유지하며, 설정된 서버 실패 때 직접 조회로 우회하지 않는다. 먼저 완료된 목록·mutation, 삭제 중인 ID, 계정 변경·로그아웃 이후의 늦은 응답은 현재 상태를 덮지 않는다. 대문자 UUID는 화면과 store에서 표준 소문자로 맞춘다.

위 실연동 명령에 `--include-detail true`를 추가하면 목록 검사와 상세 복원·다른 사용자/없는 기록·계정 변경/로그아웃 지연·오류 재시도를 함께 확인한다. 실제 임시 계정 두 개로 14개 검사를 통과했다. 근거: [.autoresearch/f08-live-verification.json](../.autoresearch/f08-live-verification.json). 실제 화면 렌더링·기기·운영 배포는 별도다.

## 코디 저장 API (F-09)

```http
POST /api/outfits
Authorization: Bearer <Supabase 사용자 접근 토큰>
Content-Type: application/json

{"requestId":"91111111-1111-4111-8111-111111111111","date":"2026-11-12","mood":"calm","weather":null,"memo":null,"itemIds":["top_001"],"itemColors":{"top_001":"#ABCDEF"}}
```

서버는 위 필드만 받고 사용자·즐겨찾기·생성시각을 클라이언트가 지정할 수 없게 한다. 실제 달력 날짜, 현재 기분/날씨 값 또는 null, 메모 100 UTF-16 단위(기존 화면의 `maxLength=100`), 중복 없는 아이템 1~100개와 아이템 ID 길이 120 이하를 검사한다. 색상은 선택된 ID의 `#RRGGBB`만 허용한다. 신규 저장은 서버 카탈로그의 정적 ID 또는 본인 소유 UUID만 받으며, 다른 사용자 소유·없는 ID는 `400`이다. 과거 코디 읽기는 이 새 입력 검사를 적용하지 않는다.

`requestId` UUID를 기존 outfits 기본 키로 사용한다. 최초 저장은 `201`, 같은 사용자/요청/내용은 행과 생성시각을 바꾸지 않고 `200`, 다른 내용 또는 충돌은 `409`다. `ON CONFLICT DO NOTHING`과 동일 트랜잭션의 본인 행 재조회로 동시 요청도 한 행만 만든다. 서로 다른 요청은 같은 날짜에도 저장한다. 이 중복 보호는 해당 행이 존재하는 동안 적용된다. 삭제 이후 재생 방지는 F-12에서 다루며 별도 이력 테이블을 만들지 않았다.

앱은 저장 시트 한 번의 열림/착장 구성에 같은 UUID를 유지해 재시도한다. 기존 연속 클릭 방지·실패 시 입력 유지·성공 후 홈 이동을 보존한다. 새로 시트를 열면 다른 저장 작업이 된다. 서버 실패 때 직접 쓰기로 우회하지 않고, 계정 변경이나 로컬 삭제 뒤 늦은 저장 결과를 반영하지 않는다. 저장이 서버에서도 취소됐다고 표시하지 않는다. 로컬 메모·즐겨찾기 변경을 이전 중복 응답으로 덮지 않는다.

실연동 명령에 `--include-detail true --include-save true`를 추가하면 실제 store 저장·목록/상세 재조회, 동시 저장 4건, 중복·충돌·입력/소유 확인과 계정 변경을 함께 확인한다. 개발 역할은 outfits SELECT/INSERT만 필요하다. 실제 임시 계정 두 개의 검사 18개와 앱 핵심 82개·서버 70개가 통과했다. 근거: [.autoresearch/f09-live-verification.json](../.autoresearch/f09-live-verification.json). 비밀 파일과 임시 계정 정리·기존 데이터 지문 비교를 별도로 완료한 뒤 기능을 체크한다.

## 코디 기분·메모 수정 API (F-10)

```http
PATCH /api/outfits/{outfitId}
Authorization: Bearer <Supabase 사용자 접근 토큰>
Content-Type: application/json

{"mood":"happy","memo":null}
```

현재 홈 편집 화면의 기분·메모만 변경한다. 보낸 필드는 수정하고 null이면 지우며, 미제공 필드는 유지한다. 빈 객체·다른 키·허용되지 않은 기분·100 UTF-16 단위 초과/비문자열 메모는 `400`이다. 제공하지 않은 과거 값은 새 입력 검사를 적용하지 않는다. 본인 행의 제공된 열만 `UPDATE ... WHERE user_id=? AND id=?`로 바꾸고 같은 트랜잭션에서 전체 `Outfit`을 반환한다. 날짜·날씨·아이템·색상·즐겨찾기·생성시각은 바꾸지 않는다. 타인/없는 기록은 동일 `404`, 무효 인증 `401`, 잘못된 ID/사용자 지정 쿼리 `400`, DB 실패는 접속 정보 없는 `500`이다.

개발 역할은 `UPDATE (mood,memo)`만 추가했다. 테이블 전체 UPDATE와 소유자·날짜·즐겨찾기 열 수정, 삭제는 불허임을 실제 권한 조회로 확인했다. 앱은 기존 ID별 순차 큐를 유지하고 성공 응답의 기분·메모만 확인 값으로 보관한다. 앞선 부분 수정만 성공하고 다음 요청이 실패해도 성공한 필드는 화면에 남는다. 재조회·늦은 상세·삭제 실패 복원에서도 이전 확인 값으로 되돌리지 않으며 계정이 바뀌면 대기 중인 다음 수정은 전송하지 않는다. 세션/직접 조회 예외도 결과를 반환해 화면의 저장 상태가 끝나게 한다.

실연동 명령에 `--include-detail true --include-save true --include-diary true`를 지정하면 저장·조회와 부분 수정/지우기, 기존 조회 대조, 연속 수정·후속 실패 복구, 계정 전환을 검증한다. 두 임시 계정의 검사 24개·앱 핵심 96개·서버 77개 통과. 추가 상태 회귀 검사 3개는 재조회 이후 실패·늦은 상세·삭제 실패 복원을 확인했다. 실제 화면·실기기·운영 배포는 포함하지 않는다. 근거: [.autoresearch/f10-live-verification.json](../.autoresearch/f10-live-verification.json).

## 본인 프로필 조회·변경 API (F-13)

```http
GET /api/profile
PATCH /api/profile   {"dailyReminderEnabled": false, "sleepingWardrobeEnabled": true}
Authorization: Bearer <Supabase 사용자 접근 토큰>
```

- 두 요청 모두 토큰 `sub` 사용자의 `profiles` 행만 다룬다. 응답 필드: `id`, `username`, `dailyReminderEnabled`, `sleepingWardrobeEnabled`, `createdAt`.
- PATCH는 앱이 실제로 바꾸는 두 불리언만 받는다. 둘 다 없으면 `400`, `id`·`username` 등 다른 키가 있으면 `400`, 불리언이 아니면 `400`. 보내지 않은 필드는 유지된다.
- 프로필 행은 가입 트리거(`handle_new_user`)가 만들므로 서버는 만들지 않는다. 행이 없으면 `404`.
- 테스트 DB에도 같은 트리거가 적용돼 `auth.users` 삽입만으로 프로필이 생기는지 함께 확인했다. 백엔드 역할에는 `profiles`의 `select, update`가 필요하다.

## 요청이 지나가는 코드

1. [ClothicBackendApplication.java](src/main/java/com/clothic/backend/ClothicBackendApplication.java)가 Spring Boot와 내장 웹 서버를 실행한다.
2. [HealthController.java](src/main/java/com/clothic/backend/health/HealthController.java)의 `@GetMapping`이 `GET /api/health`를 받는다.
3. `HealthResponse` record가 JSON 응답으로 직렬화된다.
4. 보호 경로는 [SecurityConfig.java](src/main/java/com/clothic/backend/auth/SecurityConfig.java)의 필터가 먼저 받아 [SupabaseJwtDecoderFactory.java](src/main/java/com/clothic/backend/auth/SupabaseJwtDecoderFactory.java)가 만든 디코더로 토큰을 검증하고, 통과한 요청만 [MeController.java](src/main/java/com/clothic/backend/auth/MeController.java)에 도달한다.

아이템·코디·프로필 기능은 각각 서비스·저장소 계층에서 인증 사용자 조건을 적용한다.

## 버전과 범위

- Java 21, Spring Boot `4.1.2`, 서버 개발 버전 `0.1.0-SNAPSHOT`을 사용한다. 앱 버전 `1.1.1`과 별도로 관리한다.
- 프로젝트 골격과 Maven Wrapper는 [Spring Initializr](https://start.spring.io/)에서 생성했다. 생성 메타데이터가 제시한 `4.1.2.RELEASE`는 실제 Maven Central에 없어, 제공되는 `4.1.2`로 부모 버전을 고정했다.
- [Boot 시스템 요구사항](https://docs.spring.io/spring-boot/system-requirements.html)은 Java 호환 범위의 근거다. 실제 실행 성공은 프로젝트 테스트·기동 결과로 별도 확인한다.
- F-05 실제 연결 결과는 [실행 기록](../LOG.md)과 [.autoresearch/f05-live-verification.json](../.autoresearch/f05-live-verification.json)을 참고한다. 실기기 화면 확인과 운영 배포는 후속 기능이다.
