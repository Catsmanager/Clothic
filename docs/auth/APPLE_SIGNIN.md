# Sign in with Apple 설정 가이드

iOS에서 카카오 로그인을 제공하면 App Store Guideline 4.8에 따라 Sign in with Apple도
함께 제공해야 한다. 코드는 구현되어 있으며, 아래 **계정/콘솔 설정은 사용자 작업**이다.

## 코드 구현 (완료)

- `stores/authStore.ts` — `signInWithApple()` (nonce 해시 → `supabase.auth.signInWithIdToken`)
- `app/login.tsx` — iOS 전용 Apple 로그인 버튼(`AppleAuthentication.AppleAuthenticationButton`)
- `app.json` — `ios.usesAppleSignIn: true`, `expo-apple-authentication` 플러그인
- 의존성: `expo-apple-authentication`, `expo-crypto`

## 1. Apple Developer 설정 (사용자)

1. [Apple Developer](https://developer.apple.com) → Certificates, IDs & Profiles
2. **App ID**(`com.clothic.app`)에서 **Sign In with Apple** capability 활성화
3. **Service ID** 생성 (웹/서버용 식별자) — Supabase Apple provider 설정에 사용
4. **Key** 생성: "Sign in with Apple" 체크 → `.p8` 키 파일 다운로드, Key ID 기록
5. Team ID 확인

## 2. Supabase 설정 (사용자)

Supabase Dashboard → Authentication → Providers → **Apple** 활성화 후 입력:

- **Client ID / Service ID**: Apple Developer에서 만든 Service ID
- **Team ID**, **Key ID**, **`.p8` 비공개 키** 내용
- **Authorized Client IDs / Bundle IDs** 항목이 있다면 `com.clothic.app`도 추가

> 네이티브 로그인(`signInWithIdToken`)에서 Apple identity token의 audience는 보통
> iOS 번들 ID(`com.clothic.app`)로 들어온다. Supabase Apple provider가 해당 값을
> 허용하지 않으면 토큰 검증이 실패할 수 있다.

## 3. 빌드 & 검증 (사용자)

- config plugin 추가로 **네이티브 재빌드 필요** (Expo Go ❌)
  ```bash
  eas build --platform ios --profile development   # 또는 production
  ```
- 실기기 또는 Apple 로그인이 가능한 iOS 시뮬레이터에서 Apple 로그인 버튼 → 인증 → `/(tabs)` 진입 확인
- 로컬 웹(`localhost:8081`)에서는 Apple 로그인 버튼이 보이지 않는 것이 정상이다.

## 동작 요약

1. 앱: raw nonce 생성 → SHA256 해시를 Apple에 전달
2. Apple: identityToken 반환
3. 앱: identityToken + raw nonce를 `supabase.auth.signInWithIdToken({ provider: 'apple' })`로 전달
4. Supabase: 토큰·nonce 검증 후 세션 발급 → `onAuthStateChange`가 상태 갱신
