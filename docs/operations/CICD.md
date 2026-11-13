# GitHub 개발·버전·배포 흐름

경로 기준: 앱 파일의 짧은 경로와 앱 명령은 `frontend/` 기준이다. `docs/`, `supabase/`, `HARNESS/`, `.github/`는 저장소 루트 기준이다.
작업은 최소 완료 단위의 브랜치로 나누고, 검증한 코드를 `main`에 통합한다. iOS 배포는 별도의 버전 태그와 GitHub Release로 지정한다.

## 1. 개발과 배포를 구분한다

```text
작업별 원격 브랜치 → PR → CI 검증 → main 통합
                                   ↓ 배포할 때만
                         버전 준비 PR → app-vX.Y.Z 태그
                                   ↓ 정식 Release 게시
                         같은 커밋 빌드 → 빌드 ID 검증
                                   ↓
                         TestFlight 업로드 → 기기 확인 → Apple 심사·공개
```

PR은 Pull Request, CI는 Continuous Integration(지속적 통합)이다. `main`은 통합 기준이며 현재 App Store 공개 버전과 항상 같다는 의미가 아니다. 공개 앱 기준 브랜치·태그는 별도로 기록한다.

- 독립된 작업은 확인한 통합 기준에서 시작한다. 미병합 상위 작업에 의존하는 경우에만 그 브랜치를 기준으로 삼고 PR에 의존 관계를 적는다.
- 같은 작업의 후속 수정은 기존 브랜치에 올린다. 문서 수정이나 작은 코드 변경마다 앱 버전을 올리지 않는다.
- 병합 여부·태그 생성·Release 게시·빌드 성공·TestFlight 처리·스토어 공개를 각각 구분해 기록한다.
- 아래 규칙은 GitHub Actions의 iOS 릴리스에 관한 것이다. Vercel 웹 데모는 별도다. 폴더 분리에 맞춰 루트 `vercel.json`의 설치·빌드·출력 경로를 `frontend/`로 지정한다. 호스팅 프로젝트의 Root Directory는 저장소 루트를 전제로 하며 실제 배포 성공은 별도로 확인한다.

## 2. 버전을 올리는 시점

배포할 기능과 수정 사항이 모였을 때 버전 준비 PR을 만든다. 예를 들어 다음 사용자 공개 버전을 `1.2.0`으로 결정했다면 아래 값이 모두 같아야 한다.

| 위치 | 예시 |
| --- | --- |
| `app.json`의 `expo.version` | `1.2.0` |
| `package.json`의 `version` | `1.2.0` |
| `package-lock.json`의 최상위·루트 패키지 버전 | `1.2.0` |
| Git 태그 | `app-v1.2.0` |

사용자에게 보이는 버전은 호환 가능한 버그 수정이면 PATCH, 호환 가능한 기능 추가면 MINOR, 호환성을 깨는 변경이면 MAJOR를 올리는 기준으로 판단한다. 이 기준은 프로젝트의 릴리스 규칙이며 변경 영향 검토를 대신하지 않는다. [Semantic Versioning](https://semver.org/)

현재 실제 파일의 앱 버전은 `1.1.1`이며 이번 작업에서 올리지 않았다. 위 `1.2.0`은 예시다. 불일치하던 잠금 파일의 버전 표시만 기존 앱 버전에 맞추고 의존성 목록은 유지했다.

버전 준비 시 `npm version <version> --no-git-tag-version`으로 패키지와 잠금 파일을 갱신하고 `app.json`을 같은 값으로 맞출 수 있다. 다음 검사로 일치 여부를 확인한다.

```bash
node scripts/check-release.mjs versions
node scripts/check-release.mjs versions app-v1.2.0
```

첫 명령은 버전 파일 간 일치, 둘째 명령은 지정한 태그와의 일치까지 확인한다. 예시 태그를 그대로 실행하면 현재 버전과 달라 실패하는 것이 정상이다.

기존 공개 태그를 옮기거나 덮어쓰지 않는다. 빌드 재시도는 같은 소스·앱 버전에서 새로운 빌드 번호를 쓸 수 있지만, 다른 코드를 기존 릴리스 태그에 연결하지 않는다.

## 3. CI — 모든 PR과 main push

설정 파일: [ci.yml](../../.github/workflows/ci.yml)

- 대상 브랜치와 관계없이 모든 PR을 검사한다. 다른 작업 브랜치를 대상으로 하는 PR도 포함한다.
- `main` push에서도 검사한다. 이 검사가 성공했다고 iOS 배포가 시작되지는 않는다.
- `npm ci` 후 `npm run check`로 타입·린트·포맷·아바타·핵심 로직·흐름 계약·하네스 회귀를 확인한다.
- `node scripts/check-release.mjs versions`로 버전 파일 불일치를 거부한다.
- 의존성 변경과 실제 릴리스 준비에서는 네트워크 영향을 받는 `npm run verify:environment`도 별도로 실행한다.

서버는 별도의 `Spring Boot · Java 25` 작업에서 `backend/`의 `./mvnw --batch-mode verify`를 실행한다. 실제 HTTP 상태 확인 통합 테스트를 포함한다. 앱 검사와 서버 검사를 서로 대신하지 않으며 서버 운영 배포는 별도 작업이다.

## 4. iOS 릴리스 — 버전을 지정한 Release

설정 파일: [eas-build.yml](../../.github/workflows/eas-build.yml)

자동 실행 조건은 `app-vX.Y.Z` 태그를 가리키는 **정식 GitHub Release 게시**다. 초안·사전 릴리스와 `backend-v...` 등 다른 태그는 이 자동 배포의 대상이 아니다. GitHub Release 게시가 곧 App Store 공개는 아니다.

1. 태그 형식을 확인하고 실제 태그의 커밋을 체크아웃한다.
2. 해당 커밋이 `main` 이력에 포함되어 있는지 확인한다.
3. 태그와 앱·패키지·잠금 파일의 버전 일치 및 `npm run check`를 확인한다.
4. 검증한 커밋 SHA를 지정해 Expo Application Services(EAS) iOS production 빌드를 만든다.
5. 빌드 결과의 플랫폼·프로필·완료 상태·앱 버전·소스 커밋을 확인하고 빌드 ID를 기록한다.
6. `app-store` 환경에서 **기록한 ID의 빌드**를 TestFlight에 제출한다. `--latest`로 다른 빌드를 선택하지 않는다.
7. 실행 요약에 태그·커밋·빌드 ID를 기록한다. TestFlight 처리와 실기기 검증 후 App Store 심사·공개 절차를 진행한다.

제출 작업도 Node와 프로젝트 의존성을 설치한다. Expo 플러그인을 읽어야 하므로 EAS 도구 설치만으로 프로젝트 의존성을 대신하지 않는다.

필요한 외부 설정은 `EXPO_TOKEN`, EAS iOS 서명 자격증명과 App Store Connect 제출 권한이다. 비밀키·인증서·접속 비밀번호를 저장소나 작업 로그에 넣지 않는다.

### 수동 실행

Actions에서 `Release iOS to TestFlight`를 선택하고 **main의 workflow**를 실행한다. `tag`에는 이미 존재하는 `app-vX.Y.Z`를 입력한다. `submit=false`가 기본값이므로 빌드만 수행하며, 실제 제출이 필요한 경우에만 켠다. 버전·커밋·빌드 검증은 자동 실행과 동일하다.

수동 실행과 GitHub Release 게시 모두 실제 빌드·제출을 시작할 수 있다. 정책·workflow 수정을 요청받은 것만으로 릴리스 게시나 제출까지 실행하지 않는다.

### 앱 버전과 빌드 번호

`eas.json`의 `appVersionSource=remote`, production의 `autoIncrement=true`는 유지한다. 앱의 사용자 표시 버전과 iOS `buildNumber`는 다른 값이다. 원격 자동 증가는 빌드 번호를 관리하며 사용자 표시 버전을 대신 결정하지 않는다. 실제 빌드의 앱 버전도 결과에서 다시 검사한다. [Expo 버전 관리](https://docs.expo.dev/build-reference/app-versions/)

## 5. Spring Boot와 앱은 별도 릴리스 단위다

- 앱은 `app-v1.2.0`처럼 표시한다.
- 서버는 구현 후 `backend-v0.1.0` 같은 별도 규칙으로 버전·배포를 관리한다. 현재 서버 배포 workflow는 없다.
- 첫 서버 배포 대상은 AWS Lightsail 서울이다. [아래 배포 준비 절차](#9-aws-lightsail-첫-배포-준비-r-02)를 따르며 실제 실행 전까지 R-02는 미완료로 유지한다.
- 서버만 바뀌었고 기존 앱과 호환된다면 앱 버전·스토어 제출이 항상 필요한 것은 아니다. 응답 계약·인증·지원 앱 버전의 호환성을 확인한 뒤 판단한다.
- 기존 앱이 사용하는 API(Application Programming Interface)를 바꾸는 경우, 서버와 앱을 함께 전환할지 일정 기간 호환 경로를 유지할지 정한다.

## 6. 실제 설정·검증의 현재 경계

2026-11-10 읽기 전용 확인 결과:

- `main`에는 브랜치 보호 설정이 없었다. CI를 실행하는 것과 통과를 병합 필수 조건으로 강제하는 것은 다르다.
- `app-store` 환경은 존재하지만 protection rules는 비어 있었다. 환경 이름을 workflow에 적었다고 승인자가 자동으로 생기지 않는다.
- 버전 릴리스 workflow는 #182에서 main에 병합됐다. 실제 빌드·TestFlight·스토어 공개 검증은 아직 별도 작업이다.

후속 적용 항목:

- [ ] main 병합 규칙에서 PR과 필수 CI 검사를 요구할지 설정한다. 1인 개발에서 본인이 승인할 수 없는 필수 리뷰어 수를 임의로 지정하지 않는다.
- [ ] 실제 업로드 전에 `app-store`의 승인자·태그 허용 정책을 확인하고 필요한 값을 설정한다.
- [ ] 새 workflow가 포함된 main 커밋으로 버전 준비·Release 게시·EAS 빌드·TestFlight 처리까지 검증한다.
- [ ] 실제 공개 버전·커밋·빌드 ID를 App Store Connect와 대조해 기록한다.

## 7. 공식 근거와 확인 범위

- [GitHub release 이벤트](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release)는 Release 게시 시 workflow를 실행할 수 있음을 설명한다. 저장소의 보호 설정이나 실제 실행 성공을 증명하지는 않는다.
- [EAS CLI](https://docs.expo.dev/eas/cli/)의 JSON 빌드 결과와 ID 지정 제출 옵션을 기준으로 빌드 선택을 구성했다. 자격증명·Apple 처리·실기기 동작은 실제 실행으로 별도 확인한다.
- 이 문서의 자동화는 TestFlight 업로드까지다. 공개 App Store 출시는 Apple 심사·게시 상태로 따로 확인한다.

## 8. frontend/backend 경로

GitHub Actions 앱 명령과 EAS 명령은 `frontend/`에서 실행하며 `app.json`, `eas.json`, npm 잠금 파일도 그곳에 둔다. Node 캐시는 `frontend/package-lock.json`, 서버 캐시는 `backend/pom.xml` 기준이다.

루트 `vercel.json`은 `npm --prefix frontend ci`, `npm --prefix frontend run vercel-build`, `frontend/dist`를 지정한다. SPA rewrite는 유지한다. 폴더 분리만으로 Supabase 연결 대상이나 앱 API를 바꾸지 않는다.

[Expo의 모노레포 빌드 안내](https://docs.expo.dev/build-reference/build-with-monorepos/)는 앱 디렉터리에서 EAS 명령을 실행하고 그곳에 eas.json을 둘 것을 설명한다. [Vercel 설정 안내](https://vercel.com/docs/project-configuration/vercel-json)는 설치·빌드·출력 경로 재정의의 근거다. 이 문서들은 프로젝트 자격증명이나 실제 호스팅·스토어 배포 성공을 증명하지 않는다.

## 9. AWS Lightsail 첫 배포 준비 (R-02)

2026-11-12 AWS 선택을 반영한 준비 절차다. 인스턴스·아래 실행 구성·자동 배포 workflow는 아직 만들지 않았다. 실제 완료 조건은 [plan.md](../../plan.md)의 R-02이며, 선택 근거는 [ADR-003](../architecture/ADR.md#adr-003-spring-boot-첫-배포-대상은-aws-lightsail-서울)에 있다.

### 배포 전 확정할 값

| 항목 | 준비 기준 / 남은 확인 |
| --- | --- |
| 제품·리전·용량 | Lightsail **가상 서버**, 서울 `ap-northeast-2`, Linux/Unix 공개 IPv4·1GB. 기본 요금 월 최대 7 USD. 실제 계정에서 선택 가능한 플랜·요금을 생성 전에 다시 대조한다. |
| 계정 접근 | 사용자 AWS 로그인과 Lightsail 권한을 확인한다. 현재 로컬에는 AWS 프로필·CLI가 없다. 비밀 액세스 키를 채팅으로 받지 않는다. |
| HTTPS 주소 | 보유 도메인 여부를 확인한 뒤 주소를 정한다. 주소·인증서가 검증되기 전에는 앱의 API 주소를 바꾸지 않는다. |
| 서버 버전 | main에 포함된 검증 커밋·서버 버전 태그·JAR의 SHA-256 지문을 고정한다. 기존 태그를 옮기지 않는다. |
| DB 접속 | 기존 Supabase를 유지한다. 서버 배포용 역할·필요한 테이블/열 권한·비밀 전달 경로를 확인한다. 개발용 비밀번호를 문서나 서버 이미지에 복사하지 않는다. |

1GB에서 충분히 동작하는지는 미검증이다. 빌드·테스트는 개발/지속적 통합(CI) 환경에서 수행하고 서버에는 검증한 실행 JAR를 전달하는 구성을 우선한다. 실제 메모리와 부하를 보고 용량을 판단한다. 단일 서버이므로 배포/복귀 때 짧은 중단이 발생할 수 있다. JVM 힙 상한을 서비스 설정에 명시하고(운영체제·NGINX 여유를 남긴 값에서 시작) 실제 사용량을 측정해 조정한다. 상한 값은 아직 정하지 않았다.

### 배포 실행 전 선행 조건

2026-11-13 점검([#225](https://github.com/Catsmanager/Clothic/issues/225))에서 추가했다. 아래가 확인되기 전에는 인스턴스에 서버를 올리지 않는다.

1. **Java 버전 일치** — 2026-11-13 J-01에서 main의 서버를 Java 25로 올렸다. 배포 서버에는 Java 25 런타임을 설치하고, 배포하는 JAR가 Java 25로 빌드·검증된 main 커밋에서 나온 것인지 확인한다. 서버에 설치한 런타임의 실제 버전은 배포 때 기록한다.
2. **Supabase 프로젝트 정지 확인** — 2026-11-12에 앱이 사용하는 Clothic 프로젝트가 `INACTIVE`였고 수동으로 재개했다. 2026-11-13에는 `ACTIVE_HEALTHY`를 확인했다. 정지 원인과 현재 요금제는 확인하지 못했다. 대시보드에서 요금제와 정지 사유를 확인하고, 비활성 자동 정지 대상이면 재정지를 막을 방법(요금제 변경 등)을 정한다. 서버를 배포해도 프로젝트가 정지되면 인증·조회가 모두 실패한다.
3. **배포용 DB 역할** — 개발용 `clothic_backend_dev`와 비밀번호를 배포에 재사용하지 않는다. 아래 초안을 검토한 뒤 사용자가 실행하고 조회로 확인한다.
4. **HTTPS 주소** — 도메인 사용을 권장한다. IP 인증서는 유효기간이 짧아 자동 갱신이 실패하면 앱의 모든 서버 요청이 실패한다. 도메인이 없으면 IP 인증서의 갱신 감시 방법까지 정한 뒤 진행한다.
5. **앱 복귀 기준** — 서버 주소는 앱 빌드에 포함되므로 서버 장애 시 기존 Supabase 직접 경로로 돌아가려면 새 앱 빌드·심사가 필요하다. 단일 서버의 허용 중단 시간과, 서버 주소를 넣은 앱을 공개하는 시점(R-03)의 기준을 정한다.

배포용 역할 초안(미실행). 현재 main의 서버가 실제로 실행하는 SQL과 개발 역할에서 확인한 권한에 맞춘 최소 범위다. 프로필 변경(`PATCH /api/profile`)은 앱 전환(F-14)에서 권한을 추가한다. 역할 이름은 예시이며, 비밀번호는 SQL 기록에 남지 않는 방법으로 설정한다.

```sql
create role clothic_backend_prod login bypassrls
  nosuperuser nocreatedb nocreaterole noinherit connection limit 10;

grant usage on schema public to clothic_backend_prod;
grant select, insert on public.items to clothic_backend_prod;
grant select on public.profiles to clothic_backend_prod;
grant select, insert on public.outfits to clothic_backend_prod;
grant update (mood, memo) on public.outfits to clothic_backend_prod;
```

실행 후 확인할 조회:

```sql
select rolname, rolsuper, rolbypassrls, rolcreaterole, rolconnlimit
from pg_roles where rolname = 'clothic_backend_prod';

select table_name, privilege_type from information_schema.role_table_grants
where grantee = 'clothic_backend_prod' order by 1, 2;

select table_name, column_name, privilege_type from information_schema.column_privileges
where grantee = 'clothic_backend_prod' and privilege_type = 'UPDATE' order by 1, 2;
```

이 역할은 RLS를 우회하므로 사용자 격리는 서버의 `user_id` 조건이 담당한다. 권한을 넓히는 기능은 해당 기능 작업에서 이 초안과 함께 갱신한다. 격리 테스트용 `backend/src/test/resources/db/99-grants.sql`은 실제 역할의 권한 기록이 아니다. 또한 개발 검증과 운영이 같은 Supabase 프로젝트를 사용하므로, 실사용자가 생긴 뒤에도 임시 계정으로 쓰기 검증을 계속할지 별도 프로젝트로 나눌지 정한다.

### 서버에 구성할 실행 경로

`앱 → HTTPS 443 → NGINX 역방향 프록시 → 127.0.0.1:8080의 Spring Boot → 기존 Supabase`

Java 25 실행 JAR를 전용 OS 사용자와 systemd 서비스로 실행하고 재시작·로그를 관리하는 구성을 준비한다. 개발 전용 `scripts/run-local.py`나 서버에서의 `spring-boot:run`을 운영 시작 명령으로 사용하지 않는다. NGINX는 외부 요청을 내부 서버에 전달하는 역할이며 [공식 역방향 프록시 문서](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)를 따른다. 이 구성의 설치·실행 검증은 아직 남아 있다.

- 인스턴스에 고정 IPv4를 연결하고, 외부에는 80·443만 공개한다. 원격 관리용 Secure Shell(SSH) 22번 포트는 관리자 출처 또는 필요한 브라우저 SSH 경로로 제한한다. Spring Boot 8080은 외부에 열지 않는다. IPv6를 사용하면 그 방화벽도 따로 확인한다. [고정 IP](https://docs.aws.amazon.com/lightsail/latest/userguide/lightsail-create-static-ip.html)·[Lightsail 방화벽](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-firewall-and-port-mappings-in-amazon-lightsail.html)
- 도메인이 없다고 HTTPS가 불가능한 것은 아니다. Let's Encrypt의 IP 인증서와 Certbot 5.4 이상 webroot 방식도 사용할 수 있다. 다만 짧은 유효기간에 맞춘 자동 갱신·NGINX 인증서 재적용·실기기 신뢰 검증까지 필요하다. 실제 주소와 방식은 계정/도메인 확인 뒤 정한다. [Let's Encrypt의 지원 범위와 설정 조건](https://letsencrypt.org/2026/03/11/shorter-certs-certbot)
- 추가 로드 밸런서·별도 DB·스냅샷 등 유료 리소스를 이 기본 요금에 포함된 것으로 간주하지 않는다. 연결하지 않은 고정 IP도 별도 과금될 수 있다. [Lightsail 요금 FAQ](https://aws.amazon.com/lightsail/faq/)

환경변수는 저장소 밖 권한을 제한한 서비스 설정으로 전달한다. 현재 코드의 이름은 [application.properties](../../backend/src/main/resources/application.properties)와 대조했다.

| 환경변수 | 배포 시 확인 |
| --- | --- |
| `SERVER_ADDRESS`, `SERVER_PORT` | 위 프록시 구성에서는 `127.0.0.1`, `8080` |
| `CLOTHIC_AUTH_ISSUER`, `CLOTHIC_AUTH_AUDIENCE` | 현재 Supabase 발급자, `authenticated` |
| `CLOTHIC_AUTH_JWK_SET_URI` | 현재 ES256 공개 서명 키 주소. 이 구성에서는 HMAC Secret을 함께 설정하지 않는다. |
| `CLOTHIC_DB_URL` | IPv4 session pooler와 `sslmode=verify-full`, 서버에 설치한 공식 루트 인증서 절대 경로. 로컬 임시 경로를 복사하지 않는다. |
| `CLOTHIC_DB_USERNAME`, `CLOTHIC_DB_PASSWORD`, `CLOTHIC_DB_POOL_SIZE` | 배포용 역할·비밀·실제 접속 제한에 맞춘 풀 크기 |
| `CLOTHIC_WEB_ALLOWED_ORIGINS` | 실제 웹 출처만 명시한다. 네이티브 앱 토큰 인증과 별개의 브라우저 출처 설정이다. |

### 배포 환경 검증과 이전 버전 복귀

1. main 포함 커밋에서 `backend/`의 `./mvnw --batch-mode verify`와 앱 검사를 통과시킨다. 서버 버전·커밋·JAR 지문·환경 설정 버전을 기록한다. 첫 서버 릴리스 태그는 실제 배포를 진행할 때 확정하며 문서 준비만으로 발행하지 않는다.
2. JAR를 버전별 디렉터리에 보존한다. 새 JAR와 환경 설정을 준비하고 현재 실행 버전 경로를 기록한 뒤 서비스를 전환한다. DB 스키마·기존 사용자 데이터는 이 배포에서 변경하지 않는다.
3. 외부 HTTPS에서 `GET /api/health`의 `200`을 확인한다. 이는 프로세스 응답만 입증하므로, 무토큰 `401`과 임시 검증 계정의 `/api/me`·`/api/items`·`/api/outfits` 조회, 두 계정 격리, 기존 직접 조회와의 일치를 별도로 확인한다. 쓰기 검증은 표식을 확인한 임시 계정만 사용하고 정리 후 기존 데이터 보존을 대조한다.
4. 재부팅 후 서비스 복구, 실제 메모리·응답시간, 오류 응답과 서비스/프록시 로그를 확인한다. 로그에는 토큰·비밀번호·메모 본문을 남기지 않도록 구성하고, 디스크를 소진하지 않게 보존량을 제한한다. 인증서 갱신과 서버 실패를 어디에서 확인할지도 정한다.
5. 다음 배포에서는 이전 JAR와 그 버전에 맞는 환경 설정으로 전환·재시작하고, 외부 HTTPS·인증·DB 조회가 복구되는지 확인한다. **최초 배포에서 이전 서버 버전이 없으면 이 단계는 미검증으로 기록한다.** 앱의 기존 Supabase 경로로 돌아가려면 API 주소를 비운 앱 빌드/배포가 필요하므로 즉시 서버 복귀와 같은 것으로 취급하지 않는다.
6. 실제 배포 주소·버전·검증 결과·복귀 결과를 비밀값 없이 LOG.md에 기록한 뒤 R-02의 완료 여부를 판단한다. 앱의 `EXPO_PUBLIC_CLOTHIC_API_URL` 전환과 실기기 전체 검증은 해당 앱 배포 및 R-04에서 따로 확인한다.
