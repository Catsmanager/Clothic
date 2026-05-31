# Design System

## 브랜드 키워드
Cozy · Soft · Diary · Fashion · Minimal

## 컬러 팔레트

| 토큰 | 헥스 | 용도 |
|------|------|------|
| `color.primary` | #E6D8D0 | 배경, 카드 배경 |
| `color.secondary` | #F4EEE8 | 서브 배경, 입력 필드 |
| `color.accent` | #D9B8A6 | 버튼, 강조 요소 |
| `color.text` | #2B2B2B | 본문 텍스트 |
| `color.textMuted` | #9B8B82 | 보조 텍스트, 플레이스홀더 |
| `color.border` | #E0D0C8 | 구분선, 테두리 |
| `color.white` | #FFFFFF | 카드 내부 배경 |
| `color.danger` | #C0616B | 오류 메시지, 삭제 버튼 |

## 타이포그래피

| 토큰 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| `text.h1` | 24px | 700 | 페이지 타이틀 |
| `text.h2` | 18px | 600 | 섹션 타이틀 |
| `text.body` | 14px | 400 | 본문 |
| `text.caption` | 12px | 400 | 캡션, 날짜 |
| `text.label` | 12px | 500 | 버튼 텍스트, 태그 |

폰트: 시스템 기본폰트 사용 (iOS: SF Pro, Android: Roboto)

## 스페이싱

```ts
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

## 반경 (Border Radius)

```ts
const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
}
```

## 컴포넌트 패턴

### Button
- **Primary**: bg=accent, text=white, radius=full, height=48
- **Secondary**: bg=transparent, border=accent, text=accent, radius=full, height=48
- **Danger**: bg=danger, text=white, radius=full, height=48
- 수평 패딩: 24px

### Card
- bg=white, radius=md
- 그림자: iOS `shadowOpacity: 0.08`, Android `elevation: 2`

### Input
- bg=secondary, radius=sm, height=48, border=border
- focus 시 border=accent

### Avatar Viewer
- bg=secondary, 비율 고정 1:2 (width:height)
- 레이어 Image: `position: absolute`, 모두 동일한 크기
- 레이어 순서: base → bottom → shoes → top → bag → accessory

### Tag / Chip
- bg=primary, radius=full, paddingVertical=4, paddingHorizontal=10
- 텍스트: text.label

### Empty State
- 중앙 정렬, textMuted 색상, caption 크기

## 아이콘
- 라이브러리: `@expo/vector-icons` (Feather 또는 Ionicons)
- 크기: 20px (기본), 24px (탭 바)
- 색상: text 또는 accent

## 금지사항
- 게임 UI 감성 컴포넌트 (게이지바, 포인트 표시, 레벨업 팝업 등)
- 과도한 그림자 또는 그라데이션
- 복잡한 애니메이션 (단순 opacity fade만 허용)
- accent 색상 남용 (강조 요소에만 사용)
- 탭 바 외 네비게이션 복잡도 증가 금지