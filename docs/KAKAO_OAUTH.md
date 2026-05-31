# 카카오 OAuth 연동 설정 가이드

Clothic은 Supabase Auth의 Kakao provider를 통해 카카오 소셜 로그인을 제공한다.
**코드 연동은 완료**되어 있으며(`stores/authStore.ts`의 `signInWithKakao`,
`app/login.tsx`의 "카카오로 시작하기" 버튼), 아래 **외부 콘솔 설정**을 마쳐야
실제 로그인이 동작한다.

---

## 1. 카카오 디벨로퍼스 앱 등록

1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
2. **앱 키** 확인
   - REST API 키 → Supabase의 *Kakao Client ID*로 사용
3. **카카오 로그인 활성화**
   - 제품 설정 → 카카오 로그인 → 활성화 ON
   - 동의 항목에서 필요한 정보(닉네임 등) 설정
4. **보안 → Client Secret** 생성·활성화 → Supabase의 *Kakao Client Secret*으로 사용
5. **Redirect URI 등록** (카카오 로그인 → Redirect URI):
   ```
   https://<프로젝트-ref>.supabase.co/auth/v1/callback
   ```
   - `<프로젝트-ref>`는 Supabase 프로젝트 URL의 서브도메인

---

## 2. Supabase 대시보드 설정

1. Supabase 프로젝트 → **Authentication → Providers → Kakao**
2. **Enable** ON
3. 입력값:
   | 항목 | 값 |
   |------|-----|
   | Kakao Client ID | 카카오 REST API 키 |
   | Kakao Client Secret | 카카오 Client Secret |
4. 콜백 URL(`.../auth/v1/callback`)이 카카오에 등록한 Redirect URI와 일치하는지 확인
5. **Authentication → URL Configuration → Redirect URLs**에 앱 딥링크 추가:
   ```
   clothic://auth/callback
   ```
   - 스킴 `clothic`은 `app.json`의 `expo.scheme`과 동일
   - 코드의 `Linking.createURL('auth/callback')` 결과와 일치해야 한다

---

## 3. 동작 흐름 (구현됨)

```
[카카오로 시작하기] 탭
→ supabase.auth.signInWithOAuth({ provider: 'kakao', redirectTo: clothic://auth/callback })
→ WebBrowser.openAuthSessionAsync 로 카카오 인증창 표시
→ 인증 성공 시 clothic://auth/callback?code=... 로 리다이렉트
→ Linking.parse 로 code 추출 → supabase.auth.exchangeCodeForSession(code)
→ 세션 발급 → onAuthStateChange → 인증 가드가 /(tabs)로 이동
```

- PKCE 플로우 사용: `lib/supabase.ts`의 `auth.flowType: 'pkce'`

---

## 4. 검증 체크리스트 (실기기 필요)

> 시뮬레이터/웹이 아닌 **실기기 또는 dev build**에서 확인할 것.
> Expo Go에서는 커스텀 스킴 딥링크가 제한될 수 있다.

- [ ] 카카오 버튼 → 카카오 인증창이 열린다
- [ ] 인증 동의 후 앱으로 복귀한다
- [ ] 복귀 후 세션이 발급되어 홈 화면(`/(tabs)`)으로 이동한다
- [ ] 인증창을 닫으면(취소) 에러 없이 로그인 화면에 남는다
- [ ] 앱 재실행 시 세션이 유지된다 (SecureStore)
