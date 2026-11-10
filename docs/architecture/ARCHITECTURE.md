# Architecture

경로 기준: 앱 파일의 짧은 경로와 앱 명령은 `frontend/` 기준이다. `docs/`, `supabase/`, `HARNESS/`, `.github/`는 저장소 루트 기준이다.
## 기본 구조

* Frontend: Expo + React Native
* Language: TypeScript (strict mode)
* Routing: Expo Router
* State Management: Zustand
* Storage: Supabase DB (AsyncStorage 미사용)
* Auth: Supabase Auth (이메일/비밀번호 + 카카오 OAuth)
* 현재 앱의 인증·데이터: Supabase (PostgreSQL + RLS)
* 마이그레이션 서버: `backend/`의 Java 21 + Spring Boot (상태 확인만 구현, 앱·DB 연결 전)
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
→ 내 옷장 조회 (Supabase items)
→ 내 옷장이 비었으면 기본 템플릿 선택 (로컬 constants/items.ts)
→ 선택한 템플릿을 사용자 items row로 저장
→ 아바타 레이어 렌더링
→ 코디 저장 → Supabase outfits 테이블 insert

→ 캘린더 조회 → Supabase outfits 쿼리
→ 사용자 소유가 확인된 items 기준 월간 통계 계산 (클라이언트)
→ 결과 화면 표시
```

---

## 디렉토리 구조

```text
Clothic/
├── frontend/               # Expo 앱 루트
│   ├── app/                # Expo Router 화면·인증 가드
│   ├── components/         # 공통 UI·아바타
│   ├── hooks/
│   ├── lib/                # Supabase 클라이언트·조회 보조 함수
│   ├── stores/             # authStore·itemStore·outfitStore
│   ├── constants/          # 카탈로그·디자인 상수
│   ├── assets/
│   ├── types/
│   ├── scripts/
│   ├── tests/
│   ├── app.json
│   ├── eas.json
│   └── package.json
├── backend/                # 독립 Maven·Spring Boot 프로젝트
│   ├── src/main/
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw
├── supabase/               # 기존 SQL·Edge Function 이력
├── docs/
├── HARNESS/
├── .github/workflows/      # 앱·서버 CI, 앱 버전 릴리스
├── .codex/skills/
├── plan.md                 # 기능별 실행 상태
└── vercel.json             # 루트 프로젝트에서 frontend 웹 빌드
```

---

## 핵심 데이터 구조

전체 타입 정의는 `docs/architecture/DATA_MODEL.md` 참조.

요약:
- `Item` — 사용자 소유 의류 (id, userId, catalogItemId, category, color, styleTags)
- `CatalogItem` — 모든 사용자가 둘러보는 정적 아바타 템플릿
- `Outfit` — 코디 기록 (id, userId, date, mood, weather, memo, itemIds)
- `MonthlyReport` — 월간 통계 (클라이언트 계산, DB 저장 안 함)

---

## 환경변수 (.env.local)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
