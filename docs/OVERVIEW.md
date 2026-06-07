# Clothic 앱 개요

> 패션 습관 분석 기반 모바일 코디 다이어리 앱
> 이 문서는 제품의 정체성·대상·흐름·범위를 한눈에 정리한 개요다.
> 상세 문서: [PRD](./PRD.md) · [아키텍처](./ARCHITECTURE.md) · [데이터 모델](./DATA_MODEL.md) · [디자인 시스템](./DESIGN_SYSTEM.md)

---

## 1. 한 줄 소개

사용자가 **픽셀 아바타로 매일의 코디를 만들고 날짜별로 기록**하며,
**월간 통계로 자신의 패션 습관을 분석**할 수 있는 코디 다이어리.

단순한 옷 입히기 게임이 아니라, **코디 기록과 옷장 데이터 분석**에 초점을 둔 라이프스타일 서비스다.

## 2. 대상 사용자

- 패션에 관심이 많은 **20~30대 여성**
- OOTD(오늘의 착장)를 기록하는 사용자
- 자신의 스타일을 관리·분석하고 싶은 사용자
- **옷은 많지만 자주 입는 옷만 반복**하는 사용자

### 핵심 페르소나
> "옷장에 옷은 많은데 늘 똑같은 것만 입어요. 내가 뭘 자주 입는지, 안 입는 옷은 뭔지
> 데이터로 보고 싶어요." — 20대 후반 직장인

## 3. 해결하려는 문제 & 가치

| 사용자의 문제 | Clothic의 가치 |
| --- | --- |
| 내 코디 기록이 남지 않는다 | 날짜별 코디 다이어리로 기록·회고 |
| 뭘 자주 입는지 모른다 | 월간 통계(최다 착용 아이템·색상·스타일) |
| 안 입는 옷이 방치된다 | 잠자는 옷장 분석(30일+ 미착용) |
| 기록이 지루하다 | 픽셀 아바타·챌린지로 재미 부여 |

## 4. 핵심 기능

- 픽셀 아바타 기반 코디 생성 (상의/하의/신발/가방/액세서리)
- 코디 저장 및 날짜별 기록
- 캘린더 조회
- 월간 패션 리포트 (최다 착용 아이템·색상·스타일 분석)
- 잠자는 옷장 분석
- 챌린지 기능

## 5. 사용자 흐름 (Happy Path)

```
앱 실행
  └─ (최초) 온보딩 6컷 ─→ 로그인/회원가입
        ├─ 이메일/비밀번호
        ├─ 카카오 로그인
        └─ Apple 로그인 (iOS)
  └─ 홈("오늘의 코디")
        ├─ 날짜·날씨 표시 (위치 기반 실시간 날씨)
        ├─ 오늘의 아바타 코디 + 기분/메모
        ├─ [새 코디 만들기] ─→ 코디 편집기
        │       └─ 카테고리별 아이템 선택 ─→ 저장(기분/날씨/메모)
        ├─ [저장한 코디 보기] ─→ 코디 목록 ─→ 코디 상세
        └─ 하단 탭 이동
              ├─ 홈
              ├─ 캘린더 (날짜별 코디 조회)
              ├─ (+) 새 코디 만들기
              ├─ 통계 (월간 리포트)
              └─ 옷장 (잠자는 옷장 분석)
```

## 6. 화면 구성 (라우트 기준)

| 영역 | 라우트 | 설명 |
| --- | --- | --- |
| 온보딩 | `app/onboarding.tsx` | 최초 진입 6컷 소개 |
| 인증 | `app/login.tsx`, `app/signup.tsx` | 이메일·카카오·Apple 로그인 / 회원가입 |
| 홈 | `app/(tabs)/index.tsx` | 오늘의 코디·날씨·기분/메모 |
| 코디 생성 | `app/(tabs)/create.tsx` | 아바타 편집기 |
| 아이템 선택 | `app/item-select.tsx`, `app/item-new.tsx` | 카테고리별 아이템 선택/추가 |
| 캘린더 | `app/(tabs)/calendar.tsx` | 날짜별 코디 기록 조회 |
| 통계 | `app/(tabs)/stats.tsx` | 월간 패션 리포트 |
| 잠자는 옷장 | `app/(tabs)/more.tsx` | 미착용 아이템 분석 |
| 챌린지 | `app/challenge.tsx` | 챌린지·배지 |
| 코디 목록/상세 | `app/outfits.tsx`, `app/outfit/[id].tsx` | 저장한 코디 보기 |
| 설정/프로필 | `app/profile.tsx`, `app/settings/*` | 프로필·계정 삭제·약관/개인정보 |

## 7. MVP 범위

### 포함
온보딩 · 홈 · 코디 생성(상의/하의/신발/가방/액세서리 선택) · 코디 저장 ·
코디 목록/상세 · 캘린더 · 월간 통계 · 잠자는 옷장 · 챌린지 ·
이메일·카카오·Apple 로그인 · Supabase 클라우드 저장

### 제외 (이번 버전에서 만들지 않음)
결제 · 친구/댓글/좋아요/커뮤니티 · AI 코디 추천 · 실제 의류 사진 업로드 ·
쇼핑몰 연동 · 광고 · 푸시 알림 · 다크 모드

> 원칙: **PRD의 MVP 범위를 벗어난 기능은 만들지 않는다.** (CLAUDE.md)

## 8. 기술 스택 & 아키텍처

- **프레임워크**: Expo · React Native · TypeScript(strict)
- **라우팅**: Expo Router (파일 기반)
- **상태관리**: Zustand (`authStore` / `outfitStore` / `itemStore`)
- **백엔드**: Supabase (Auth + PostgreSQL)
- **보안 저장소**: expo-secure-store (세션 토큰, AsyncStorage 미사용)
- **외부 연동**: 카카오 OAuth, Apple Sign-In, Open-Meteo(날씨), expo-location

아키텍처 원칙: 라우트 화면은 조립만 담당하고, 로직은 `hooks/`·`lib/`로,
재사용 UI는 `components/`로 분리한다. 상세는 [ARCHITECTURE.md](./ARCHITECTURE.md).

## 9. 데이터 모델 (요약)

| 테이블 | 핵심 컬럼 |
| --- | --- |
| `profiles` | id(=auth user), username |
| `items` | user_id, name, category, color, style_tags, image_path |
| `outfits` | user_id, date, mood, weather, memo, item_ids[], is_favorite |

상세 스키마는 [DATA_MODEL.md](./DATA_MODEL.md).

## 10. 성공 기준

- 사용자가 코디를 생성·저장할 수 있다.
- 캘린더에서 코디 기록을 확인할 수 있다.
- 월간 통계를 확인할 수 있다.
- 30일 이상 입지 않은 아이템(잠자는 옷장)을 확인할 수 있다.
- 앱을 종료/재설치해도 로그인 시 데이터가 유지·복원된다.

## 11. 출시 준비 현황 (App Store / Google Play)

목표: **App Store · Google Play 출시** (개인 포트폴리오 + RN 실전 경험).

| 항목 | 상태 |
| --- | --- |
| 핵심 화면·기능 | 구현/진행 중 |
| 실시간 날씨 연동 | 구현 |
| 계정 삭제(Guideline 5.1.1(v)) | 코드 구현 / Edge Function 배포 필요 |
| Sign in with Apple(Guideline 4.8) | 코드 구현 / Apple·Supabase 설정 필요 |
| 개인정보 처리방침 | 초안 작성 / 호스팅 필요 |
| EAS Build·제출 | 설정 완료 / Expo·Apple 계정·빌드 필요 |

상세: [CICD.md](./CICD.md) · [APPLE_SIGNIN.md](./APPLE_SIGNIN.md) · [KAKAO_OAUTH.md](./KAKAO_OAUTH.md)
