# Asset Plan

## 아트 스타일
- 스타일: 픽셀 아트 (라이프스타일 앱 감성, 게임 감성 금지)
- 캔버스 크기: 아바타 기준 64×128px (2x 해상도 제공: 128×256px)
- 파일 형식: PNG (투명 배경)
- 색상 모드: 32비트 RGBA

## 아바타 레이어 구조

렌더링 순서 (아래 → 위):

1. `base` — 아바타 기본 체형 (고정, 1종)
2. `bottom` — 하의
3. `shoes` — 신발
4. `top` — 상의
5. `bag` — 가방
6. `accessory` — 액세서리

## 파일 네이밍 규칙

패턴: `{category}_{id:03d}_{colorKey}.png`

예시:
- `top_001_white.png`
- `top_002_black.png`
- `bottom_001_denim.png`
- `shoes_001_white.png`
- `bag_001_beige.png`
- `accessory_001_hat.png`
- `base_female_01.png`

## MVP 에셋 수량 계획

| 카테고리 | MVP 수량 | 예시 |
|---------|---------|------|
| base | 1 | 여성형 단일 체형 |
| top | 10 | 티셔츠, 블라우스, 니트, 재킷 등 |
| bottom | 8 | 팬츠, 스커트, 쇼츠, 레깅스 등 |
| shoes | 6 | 스니커즈, 힐, 로퍼, 부츠 등 |
| bag | 5 | 숄더백, 토트, 크로스백 등 |
| accessory | 4 | 모자, 선글라스, 스카프 + none(미착용) |

총 **34개** 에셋

## 저장 위치

```
assets/
  avatar/
    base/
      base_female_01.png
      base_female_01@2x.png
    top/
      top_001_white.png
      top_001_white@2x.png
      ...
    bottom/
    shoes/
    bag/
    accessory/
```

## 제작 워크플로우

1. 기본 체형(base) 제작
2. 카테고리별 레이어 제작 (base 위에 합성 테스트)
3. 모든 조합 스크린샷으로 시각 확인
4. `assets/avatar/` 에 배치
5. `constants/items.ts` 에 메타데이터 등록

## 색상 키 목록

`white` `black` `gray` `navy` `beige` `brown` `pink` `blue` `green` `red` `yellow` `purple` `denim` `stripe` `check` `floral`

## 금지사항
- 배경 있는 PNG 사용 금지
- 레이어 크기 불일치 금지 (모든 레이어는 동일한 캔버스 크기 유지)
- 64×128px 미만 해상도 금지
