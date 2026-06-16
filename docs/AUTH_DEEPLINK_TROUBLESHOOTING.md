# 인증 딥링크/콜백 트러블슈팅 (비밀번호 재설정·이메일 인증·OAuth)

이메일 링크/딥링크가 앱의 올바른 화면으로 돌아오지 않을 때 보는 문서.
2026-06-14 비밀번호 재설정 디버깅 경험을 정리한 것이다. (이슈 #99 / PR #100)

---

## 1. 그날 무슨 일이 있었나

### 증상
- 비밀번호 재설정 이메일은 **정상 발송**됨.
- 메일의 링크를 누르면 **새 비밀번호 설정 화면(`/reset-password`)이 아니라 홈으로** 감.
- 중간중간 **로그인 화면(`/login`)으로 튕기기도** 함.

### 처음 의심했지만 원인이 **아니었던** 것
- **Site URL(`http://localhost:8081`)** — 정상. 이건 fallback 주소일 뿐.
- **Redirect URLs 허용 목록** — 정상. (`http://localhost:8081/auth/callback`, `clothic://auth/callback` 등 등록돼 있었음)
- **이메일 템플릿** — 정상. 링크에 `type=recovery`와 `redirect_to`가 잘 들어 있었음.

### 진짜 원인
앱이 **PKCE 흐름**(`lib/supabase.ts`의 `flowType: 'pkce'`)을 쓴다.
Supabase의 `/auth/v1/verify` 엔드포인트가 재설정 링크를 처리하고 앱으로 되돌릴 때,
콜백 URL을 **`.../auth/callback?code=...` 형태로만** 보내고 **`type=recovery`를 떨군다.**

→ 콜백 핸들러(`handleAuthCallback`)는 `type=recovery`가 있어야 "재설정 흐름"으로 인식하는데,
그게 없으니 일반 로그인으로 취급 → 홈(`/(tabs)`, URL상으로는 `/`)으로 보냄.

> **중요한 함정:** Expo Router에서 `(tabs)` 그룹은 URL에 안 나타난다.
> 그래서 홈 화면의 주소는 `http://localhost:8081/`이다.
> "루트(`/`)로 갔다" = "홈으로 갔다"이지, "Site URL로 fallback됐다"가 **아닐 수 있다.** 헷갈리지 말 것.

### `/login`으로 튕긴 건 별개의 일시적 현상
재설정 링크는 **일회용**이다. 디버깅하며 같은 링크를 두 번 누르거나 오래된 메일을 누르면
`otp_expired`(`Email link is invalid or has expired`)가 나고, 콜백이 에러를 리턴해 `/login`으로 보낸다.
**코드 버그가 아니라 링크 재사용** 때문. 새 메일 + 1회 클릭으로 해결됐다.

### 최종 수정 (`stores/authStore.ts`)
- `sendPasswordReset`: 우리가 보내는 `redirect_to`에 표식을 직접 심는다.
  ```ts
  const redirectTo = Linking.createURL('auth/callback', { queryParams: { intent: 'recovery' } })
  ```
  Supabase가 여기에 `&code=...`를 덧붙여도 `intent=recovery`는 유지된다.
- `handleAuthCallback`: `type=recovery`(implicit) **또는** `intent=recovery`(PKCE, 우리 표식)면 재설정으로 인식.
  ```ts
  const recovery =
    getUrlParam(url, 'type') === 'recovery' || getUrlParam(url, 'intent') === 'recovery'
  ```

---

## 2. 다음에 같은 일이 생기면 — 진단 순서

순서대로 하면 빠르게 갈린다. **추측하지 말고 실제 URL을 봐라.**

### STEP 0. 분류부터
- "이메일이 **안 온다**" → 인증 콜백 문제 아님. Supabase Auth 로그(Dashboard → Logs)와 SMTP/Rate limit 확인. 이 문서 범위 밖.
- "이메일은 **오는데** 링크가 엉뚱한 데로 간다" → 이 문서 계속.

### STEP 1. 메일 링크 자체를 까본다
메일에서 버튼 우클릭 → **링크 주소 복사**. 형태 확인:
```
https://<project>.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=http://localhost:8081/auth/callback
```
- `type`, `redirect_to`가 멀쩡한가? → 멀쩡하면 **이메일 템플릿/Supabase 설정은 무죄.** STEP 2로.
- `redirect_to`가 없거나 이상 → **이메일 템플릿** 문제. (`{{ .ConfirmationURL }}`을 건드렸는지 확인)

### STEP 2. 클릭 후 **최종 URL**을 본다 (가장 중요)
브라우저 주소창을 끝까지(쿼리 `?...`와 해시 `#...`까지) 확인:

| 최종 URL | 의미 | 조치 |
|---|---|---|
| `localhost:8081/#error=...&error_code=otp_expired` | 일회용 토큰 만료/소진 | **새 메일 + 1회만 클릭.** STEP 4 참고 |
| `localhost:8081/` (에러 없이 깨끗) | 콜백 성공 but 잘못된 화면(=홈)으로 감 | **STEP 3** (recovery 인식 문제 — 이번 케이스) |
| `localhost:8081/login` | 콜백이 에러 리턴 **또는** 콜백 도달 못 함 | STEP 3의 진단 코드로 갈라낼 것 |
| `localhost:8081/auth/callback?...` 에서 멈춤 | 콜백 처리 중 에러 표시 | 그 화면/콘솔의 에러 메시지 확인 |

> 주의: `localhost:8081/`(루트)는 **홈**이다(위 함정 참고). 루트로 갔다고 무조건 "Supabase가 Site URL로 fallback했다"고 단정하지 말 것.

### STEP 3. 콜백 내부를 들여다본다 (진단 코드 임시 삽입)
에러가 화면에서 순식간에 사라져 안 보이면, `app/auth/callback.tsx`에 **임시로** 넣는다:
```ts
handledRef.current = true
console.log('[auth/callback] url =', url)              // 실제 콜백 URL
const { error, recovery } = await handleAuthCallback(url)
console.log('[auth/callback] result =', { error, recovery })
if (error) {
  setMessage(`에러: ${error}\n\nURL: ${url}`)          // 자동 이동 멈추고 화면에 표시
  return
}
router.replace(recovery ? '/reset-password' : '/(tabs)')
```
브라우저 **DevTools(F12) → Console**에서 두 줄을 읽는다. (사용자는 입력할 것 없이 **읽기만** 하면 됨)

판독:
- 콘솔에 `[auth/callback] url =` 줄이 **아예 없다** → 콜백에 도달 못 함 → `redirect_to`가 허용 목록과 안 맞아 Site URL로 fallback. **Redirect URLs 저장 여부/정확성** 확인.
- `url`에 `?code=...`만 있고 `type`/`intent`가 **없는데** `recovery: false` → **이번 케이스.** PKCE가 `type=recovery`를 떨군 것. → 수정안(아래) 적용.
- `url`에 `code`가 있는데 **error 리턴** → `exchangeCodeForSession` 실패. `otp_expired`(STEP 4) 또는 `code_verifier` 누락(메일을 다른 브라우저/기기에서 열었는지 확인).

**확인 끝나면 진단 코드는 반드시 제거**한다.

### STEP 4. `otp_expired`가 계속 나면
재설정/인증 링크는 **일회용**이다.
1. 받은 편지함의 **기존 메일 전부 삭제** → **새 메일 1회 요청** → **최신 메일 1회만** 클릭.
2. 메일 보낸 브라우저 = 링크 클릭 브라우저가 **같아야** 한다(PKCE `code_verifier`가 그 브라우저 localStorage에 있음). 시크릿창/다른 브라우저 ❌.
3. 그래도 **진짜 첫 클릭에서도** 만료되면 → **Gmail/메일 보안 스캐너가 링크를 미리 GET해서 토큰을 소진**하는 것. 알려진 이슈. 메일 템플릿을 `{{ .TokenHash }}` + 자체 페이지에서 `verifyOtp({ token_hash, type })` 호출하는 방식으로 우회해야 한다. (이번엔 여기까진 안 감)

---

## 3. 핵심 원리 메모

- **이 앱은 PKCE 흐름이다** (`lib/supabase.ts` → `flowType: 'pkce'`, `detectSessionInUrl: false`).
  콜백은 `?code=`로 돌아오고, `exchangeCodeForSession(code)`로 세션을 만든다.
- PKCE에서 `exchangeCodeForSession`은 `SIGNED_IN` 이벤트만 발생시킨다.
  **`PASSWORD_RECOVERY` 이벤트는 안 뜬다** (그건 implicit + `detectSessionInUrl` 환경의 동작).
  → 그래서 "onAuthStateChange로 recovery 감지"는 이 앱에선 **안 통한다.**
- 그래서 재설정/일반 로그인/이메일 인증을 구분하려면 **우리가 `redirect_to`에 표식을 심는 방식**이 가장 견고하다.
  (웹 새로고침·기기와 무관하게 동작. 콜백 URL의 쿼리만 보면 됨)
- `redirect_to`에 쿼리스트링(`?intent=recovery`)을 붙여도 **허용 목록 매칭에는 영향 없다**(경로 기준 매칭). 안전장치로 `http://localhost:8081/**` 와일드카드도 등록돼 있다.

## 4. 관련 위치

| 항목 | 위치 |
|---|---|
| Supabase 클라이언트 설정(PKCE) | `lib/supabase.ts` |
| 재설정 메일 발송 / 콜백 처리 / 새 비번 설정 | `stores/authStore.ts` (`sendPasswordReset`, `handleAuthCallback`, `updatePassword`) |
| 콜백 화면(라우팅 분기) | `app/auth/callback.tsx` |
| 새 비밀번호 입력 화면 | `app/reset-password.tsx` |
| 인증 가드(미로그인 시 `/login`으로) | `app/_layout.tsx` |
| Supabase 대시보드 설정 체크리스트 | `docs/SUPABASE_TODO.md` (5번 Auth 설정) |

## 5. 한 줄 교훈
- **추측하지 말고 실제 URL을 봐라.** (메일 링크 원문 + 클릭 후 최종 URL + 콜백 콘솔 로그)
- **`localhost:8081/`(루트)는 홈이다.** Site URL fallback과 헷갈리지 말 것.
- **링크는 일회용.** 디버깅 중엔 매번 새 메일 + 1회 클릭.
