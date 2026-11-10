# GitHub 개발·버전·배포 흐름

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
- 아래 규칙은 GitHub Actions의 iOS 릴리스에 관한 것이다. Vercel 웹 데모의 자동 배포 설정을 변경한 것은 아니다.

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

서버는 별도의 `Spring Boot · Java 21` 작업에서 `backend/`의 `./mvnw --batch-mode verify`를 실행한다. 실제 HTTP 상태 확인 통합 테스트를 포함한다. 앱 검사와 서버 검사를 서로 대신하지 않으며 서버 운영 배포는 별도 작업이다.

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
- 서버만 바뀌었고 기존 앱과 호환된다면 앱 버전·스토어 제출이 항상 필요한 것은 아니다. 응답 계약·인증·지원 앱 버전의 호환성을 확인한 뒤 판단한다.
- 기존 앱이 사용하는 API(Application Programming Interface)를 바꾸는 경우, 서버와 앱을 함께 전환할지 일정 기간 호환 경로를 유지할지 정한다.

## 6. 실제 설정·검증의 현재 경계

2026-11-10 읽기 전용 확인 결과:

- `main`에는 브랜치 보호 설정이 없었다. CI를 실행하는 것과 통과를 병합 필수 조건으로 강제하는 것은 다르다.
- `app-store` 환경은 존재하지만 protection rules는 비어 있었다. 환경 이름을 workflow에 적었다고 승인자가 자동으로 생기지 않는다.
- 이번 변경은 workflow·검증 코드·문서·스킬을 PR로 제안하는 작업이다. `main`에 병합되기 전에는 새 기본 운영 방식이 적용됐다고 하지 않는다.

후속 적용 항목:

- [ ] main 병합 규칙에서 PR과 필수 CI 검사를 요구할지 설정한다. 1인 개발에서 본인이 승인할 수 없는 필수 리뷰어 수를 임의로 지정하지 않는다.
- [ ] 실제 업로드 전에 `app-store`의 승인자·태그 허용 정책을 확인하고 필요한 값을 설정한다.
- [ ] 새 workflow가 포함된 main 커밋으로 버전 준비·Release 게시·EAS 빌드·TestFlight 처리까지 검증한다.
- [ ] 실제 공개 버전·커밋·빌드 ID를 App Store Connect와 대조해 기록한다.

## 7. 공식 근거와 확인 범위

- [GitHub release 이벤트](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release)는 Release 게시 시 workflow를 실행할 수 있음을 설명한다. 저장소의 보호 설정이나 실제 실행 성공을 증명하지는 않는다.
- [EAS CLI](https://docs.expo.dev/eas/cli/)의 JSON 빌드 결과와 ID 지정 제출 옵션을 기준으로 빌드 선택을 구성했다. 자격증명·Apple 처리·실기기 동작은 실제 실행으로 별도 확인한다.
- 이 문서의 자동화는 TestFlight 업로드까지다. 공개 App Store 출시는 Apple 심사·게시 상태로 따로 확인한다.
