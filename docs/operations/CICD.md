# CI/CD 가이드

Clothic의 지속적 통합(CI)과 EAS 빌드/제출(CD) 구성 문서.

## 1. CI — GitHub Actions (`.github/workflows/ci.yml`)

PR 및 `develop`/`main` 푸시 시 자동 실행:

| 단계    | 명령            | 목적                                                         |
| ------- | --------------- | ------------------------------------------------------------ |
| Install | `npm ci`        | lockfile 기준 설치                                           |
| Verify  | `npm run check` | 타입·lint·format·avatar·핵심 로직·합성 habit-flow 회귀 차단 |

`expo-doctor`와 `expo install --check`는 환경·네트워크 영향을 받을 수 있어
`npm run verify:environment`로 분리한다. 의존성 변경 PR과 출시 전 로컬에서 실행한다.

## 2. CD — EAS Build / Submit

App Store 출시까지의 빌드·제출은 [EAS](https://docs.expo.dev/eas/)를 사용한다.
빌드 프로필은 `eas.json`에 정의돼 있다(development / preview / production).

### 사전 준비 (사용자 작업, 외부 계정 필요)

1. **Expo 계정**: <https://expo.dev> 가입 후
   - `npx eas-cli@latest login`
   - `npx eas-cli@latest init` — 프로젝트를 Expo에 연결(`app.json`에 `extra.eas.projectId` 추가됨)
2. **Apple Developer 계정**: 연 $99 멤버십(App Store 제출 필수)
3. **자격증명**: `npx eas-cli@latest credentials` 또는 빌드 시 EAS가 대화형으로 생성/관리

### 로컬에서 빌드/제출

```bash
# iOS production 빌드 (클라우드)
npx eas-cli@latest build --platform ios --profile production --wait

# 최신 빌드를 TestFlight에 업로드
npx eas-cli@latest submit --platform ios --profile production --latest --non-interactive
```

`eas.json`의 `submit.production.ios`는 App Store Connect 앱 ID와 팀을 가리킨다.
제출 인증은 저장소 파일이 아니라 EAS에 등록한 App Store Connect API key를 사용한다.

### GitHub Actions에서 자동 release (`.github/workflows/eas-build.yml`)

`main`의 CI가 성공하면 다음 순서로 실행된다.

1. 같은 커밋에서 `npm run check` 재검증
2. EAS iOS production 빌드 완료까지 대기
3. `app-store` 환경 승인 후 최신 빌드를 TestFlight에 업로드

수동 실행도 가능하다. Actions → **Release iOS to TestFlight** → Run workflow에서
`submit`을 선택하면 된다. `app-store` 환경에 Required reviewers를 설정하면 main 병합 후
Apple/TestFlight 업로드 전에 반드시 승인을 받는다.

필수 설정:

1. Expo에서 액세스 토큰 발급: <https://expo.dev/accounts/[account]/settings/access-tokens>
2. GitHub 저장소 → Settings → Secrets and variables → Actions → **`EXPO_TOKEN`** 등록
3. Expo 프로젝트에서 iOS signing과 App Store Connect API key를 설정한다:
   `npx eas-cli@latest credentials --platform ios`
4. GitHub 저장소 → Settings → Environments → **`app-store`** 생성 후 Required reviewers 지정

App Store Connect API key는 EAS에 저장하는 방식을 권장한다. Apple 인증 정보나 `.p8` 키를
저장소·workflow 파일에 직접 넣지 않는다.

## 3. App Store 출시 체크리스트

- [x] Expo 계정 + `eas init` 완료 (`app.json`에 `extra.eas.projectId` 존재)
- [ ] Apple Developer 멤버십 활성화
- [ ] EAS에 iOS signing credentials와 App Store Connect API key 등록
- [ ] GitHub Actions secret `EXPO_TOKEN` 등록
- [ ] GitHub `app-store` environment Required reviewers 설정
- [ ] 앱 아이콘/스플래시 최종본 적용 (현재 `assets/` placeholder)
- [x] App Store Connect 앱 ID와 Bundle ID 설정 (`eas.json`, `app.json`)
- [ ] TestFlight 검증 → App Store 심사 제출

## 4. 한계

코드/workflow 구성은 완료됐다. **실제 자동 빌드·TestFlight 업로드는 Expo·Apple 계정,
EAS credentials, `EXPO_TOKEN`, `app-store` environment 승인이 등록돼야 동작**한다.
TestFlight에 업로드된 빌드를 실제 App Store에 공개하려면 App Store Connect에서
메타데이터를 확인하고 Apple 심사를 제출해야 한다. EAS Submit만으로는 심사를 우회할 수 없다.
