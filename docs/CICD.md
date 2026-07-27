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
   - `npx eas login`
   - `npx eas init` — 프로젝트를 Expo에 연결(`app.json`에 `extra.eas.projectId` 추가됨)
2. **Apple Developer 계정**: 연 $99 멤버십(App Store 제출 필수)
3. **자격증명**: `npx eas credentials` 또는 빌드 시 EAS가 대화형으로 생성/관리

### 로컬에서 빌드/제출

```bash
# iOS production 빌드 (클라우드)
npx eas build --platform ios --profile production

# 빌드 완료 후 App Store Connect 제출
npx eas submit --platform ios --profile production
```

`eas.json`의 `submit.production.ios`에는 플레이스홀더가 들어 있다 — 실제 값으로 교체:

- `appleId`: Apple 계정 이메일
- `ascAppId`: App Store Connect 앱의 숫자 ID
- `appleTeamId`: Apple Developer 팀 ID

### GitHub Actions에서 빌드 (`.github/workflows/eas-build.yml`)

수동 트리거(`workflow_dispatch`)로 production 빌드를 실행한다.

1. Expo에서 액세스 토큰 발급: <https://expo.dev/accounts/[account]/settings/access-tokens>
2. GitHub 저장소 → Settings → Secrets and variables → Actions →
   **`EXPO_TOKEN`** 으로 등록
3. Actions 탭 → "EAS Build (production)" → Run workflow → 플랫폼 선택

## 3. App Store 출시 체크리스트

- [ ] Expo 계정 + `eas init` 완료 (`projectId` 발급)
- [ ] Apple Developer 멤버십 활성화
- [ ] `eas.json` submit 플레이스홀더를 실제 값으로 교체
- [ ] 앱 아이콘/스플래시 최종본 적용 (현재 `assets/` placeholder)
- [ ] App Store Connect에 앱 레코드 생성 (Bundle ID `com.clothic.app`)
- [ ] `eas build --platform ios --profile production`
- [ ] `eas submit --platform ios --profile production`
- [ ] TestFlight 검증 → 심사 제출

## 4. 한계

코드/설정/문서까지는 구축됨. **실제 빌드와 App Store 제출은 Expo·Apple 계정과
EXPO_TOKEN 등 자격증명이 등록돼야 동작**하며, 이는 사용자만 수행할 수 있다.
