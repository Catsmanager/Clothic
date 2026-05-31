# 아바타 에셋 제작 체크리스트

> 이 폴더에 들어갈 PNG 스프라이트 명세. `docs/ASSET_PLAN.md` 와 `constants/items.ts` 의 `imagePath` 가 이 목록과 1:1로 일치해야 한다.

## 공통 규격
- 캔버스: 64×128px (2x: 128×256px, `@2x` 접미사)
- 형식: PNG, 투명 배경, 32비트 RGBA
- 모든 레이어 동일 캔버스 크기 (정렬 일치)
- 배경 있는 PNG 금지

## 레이어 렌더 순서 (아래 → 위)
1. base → 2. bottom → 3. shoes → 4. top → 5. bag → 6. accessory
(`constants/items.ts` 의 `RENDER_ORDER` 와 동일)

## 파일 네이밍
`{category}/{category}_{id:03d}_{key}.png` — clothing은 `key`=색상키, accessory는 `key`=종류

## 제작 목록 (총 33종 + base 1)

### base (완료)
- [x] `base/base_female_01.png`

### top (10)
- [ ] `top/top_001_black.png` — 블랙 민소매
- [ ] `top/top_002_white.png` — 화이트 티
- [ ] `top/top_003_gray.png` — 그레이 민소매
- [ ] `top/top_004_stripe.png` — 스트라이프
- [ ] `top/top_005_gray.png` — 그레이 티
- [ ] `top/top_006_black.png` — 블랙 티
- [ ] `top/top_007_beige.png` — 베이지 가디건
- [ ] `top/top_008_white.png` — 화이트 블라우스
- [ ] `top/top_009_beige.png` — 크림 니트
- [ ] `top/top_010_navy.png` — 네이비 니트

### bottom (8)
- [ ] `bottom/bottom_001_denim.png` — 데님 쇼츠
- [ ] `bottom/bottom_002_black.png` — 블랙 팬츠
- [ ] `bottom/bottom_003_beige.png` — 베이지 스커트
- [ ] `bottom/bottom_004_gray.png` — 그레이 팬츠
- [ ] `bottom/bottom_005_black.png` — 블랙 레깅스
- [ ] `bottom/bottom_006_white.png` — 화이트 미니스커트
- [ ] `bottom/bottom_007_green.png` — 카키 쇼츠
- [ ] `bottom/bottom_008_beige.png` — 크림 팬츠

### shoes (6)
- [ ] `shoes/shoes_001_white.png` — 화이트 스니커즈
- [ ] `shoes/shoes_002_black.png` — 블랙 부츠
- [ ] `shoes/shoes_003_beige.png` — 베이지 로퍼
- [ ] `shoes/shoes_004_beige.png` — 누드 힐
- [ ] `shoes/shoes_005_black.png` — 블랙 스니커즈
- [ ] `shoes/shoes_006_brown.png` — 브라운 부츠

### bag (5)
- [ ] `bag/bag_001_beige.png` — 베이지 숄더백
- [ ] `bag/bag_002_beige.png` — 크림 토트
- [ ] `bag/bag_003_black.png` — 블랙 크로스백
- [ ] `bag/bag_004_brown.png` — 브라운 숄더백
- [ ] `bag/bag_005_white.png` — 화이트 클러치

### accessory (4, none 포함)
- [ ] `accessory/accessory_001_hat.png` — 베레모
- [ ] `accessory/accessory_002_sunglasses.png` — 선글라스
- [ ] `accessory/accessory_003_scarf.png` — 스카프
- [x] none(미착용) — 이미지 없음 (`imagePath: ''`)
