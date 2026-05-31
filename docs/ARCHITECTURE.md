# Architecture

## 기본 구조

* Frontend: Expo + React Native
* Language: TypeScript (strict mode)
* Routing: Expo Router
* State Management: Zustand
* Storage: Supabase DB (AsyncStorage 미사용)
* Auth: Supabase Auth (이메일/비밀번호 + 카카오 OAuth)
* Backend: Supabase (PostgreSQL + RLS)
* Styling: React Native StyleSheet

---

## 패키지

| 패키지 | 용도 |
|--------|------|
| `@supabase/supabase-js` | Supabase 클라이언트 |
| `expo-secure-store` | Auth 세션 저장 (SecureStore) |
| `expo-web-browser` | 카카오 OAuth WebBrowser |
| `expo-router` | 파일 기반 라우팅 |
| `zustand` | 전역 상태 관리 |
| `@expo/vector-icons` | 아이콘 |

---

## 데이터 흐름

```
User
→ 로그인 (이메일 or 카카오)
→ Supabase Auth 세션 발급
→ 홈 화면 진입

→ 코디 생성
→ 아이템 선택 (로컬 constants/items.ts 참조)
→ 아바타 레이어 렌더링
→ 코디 저장 → Supabase outfits 테이블 insert

→ 캘린더 조회 → Supabase outfits 쿼리
→ 월간 통계 계산 (클라이언트)
→ 결과 화면 표시
```

---

## 디렉토리 구조

```
app/
  _layout.tsx           ← 인증 가드
  (auth)/
    login.tsx
    signup.tsx
  (tabs)/
    index.tsx           ← 홈
    calendar.tsx
    stats.tsx
    closet.tsx
    challenge.tsx

lib/
  supabase.ts           ← Supabase 클라이언트

store/
  authStore.ts
  outfitStore.ts
  itemStore.ts

constants/
  items.ts              ← 아이템 메타데이터 (에셋 경로 포함)
  colors.ts
  spacing.ts

assets/
  avatar/               ← 픽셀 아바타 에셋 (ASSET_PLAN.md 참조)
```

---

## 핵심 데이터 구조

전체 타입 정의는 `docs/DATA_MODEL.md` 참조.

요약:
- `Item` — 의류 아이템 (id, userId, category, imagePath, color, styleTags)
- `Outfit` — 코디 기록 (id, userId, date, mood, weather, memo, itemIds)
- `MonthlyReport` — 월간 통계 (클라이언트 계산, DB 저장 안 함)

---

## 환경변수 (.env.local)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```