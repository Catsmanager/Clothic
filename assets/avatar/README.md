# Clothic 아바타 에셋 규격

`assets/avatar/base/base_female_01.png`를 canonical canvas로 사용한다.

## 공통 규격

- 캔버스: 1024×1536px (2:3)
- 형식: 8-bit RGBA PNG
- 배경: 레이어 바깥은 투명
- 정렬: 모든 착장 레이어의 좌상단 기준점은 `(0, 0)`
- 범위: 의상만 crop하지 않고 full canvas를 유지
- 앱 등록 목록: `constants/itemCatalog.ts`
- 정적 이미지 매핑: `lib/avatarAssets.ts`

캔버스 규격을 바꾸려면 base와 등록된 모든 레이어를 한 번에 마이그레이션해야 한다. 새 에셋 하나를 다른 비율로 추가하지 않는다.

## 카테고리와 렌더 순서

현재 카테고리는 `top`, `outer`, `bottom`, `dress`, `shoes`, `hair`, `accessory`다. 가방은 별도 카테고리가 아니라 `accessory`의 하위 분류다.

기본 렌더 순서는 `constants/items.ts`의 `RENDER_ORDER`를 따른다:

```text
base → shoes → bottom → dress → top → outer → hair → accessory
```

아이템별 예외는 `lib/avatarAssets.ts`의 `layerOrder`로만 관리한다.

## 파일명

```text
{category}/{category}_###_{color-or-kind}.png
```

예:

- `top/top_010_cream_knit.png`
- `bottom/bottom_016_gray_pleated_skirt.png`
- `accessory/accessory_006_brown_shoulder_bag.png`

## 등록과 검증

직접 그리지 않는 ImageGen 후보 생성부터 검수·등록까지는 `$clothic-avatar-pipeline` skill을 사용한다.

새 파일은 먼저 dry-run으로 확인한다:

```bash
npm run avatar:add -- <metadata...> --preview-from <same-category-id> --dry-run
```

승인 후 등록하고 전체 동기화를 검사한다:

```bash
npm run avatar:add -- <metadata...>
npm run avatar:check
```

`avatar:check`는 catalog ↔ asset map ↔ disk의 1:1 동기화, 중복/고아 파일,
category/id ↔ 경로/파일명, PNG CRC·필수 chunk·1024×1536 canvas·8-bit RGBA,
실제 투명/가시 픽셀을 검사한다. 정렬·halo·stray pixel은 자동 검사를 보완하는 사람의
overlay 검수가 필요하다.
