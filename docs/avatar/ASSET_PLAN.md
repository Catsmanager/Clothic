# Asset Plan

## 아트 방향

- 스타일: 차분한 semi-pixel 패션 일러스트
- canonical canvas: 1024×1536px (2:3)
- 형식: 8-bit RGBA PNG
- 배경: 레이어 바깥 완전 투명
- 정렬 기준: `assets/avatar/base/base_female_01.png`

현재 base와 등록된 착장 레이어가 모두 이 규격을 사용한다. 과거의 64×128, 1:2, `@2x` 규칙은 폐기한다. 앱용 해상도를 낮추려면 개별 파일이 아니라 전체 에셋을 같은 2:3 비율로 일괄 마이그레이션한다.

## 카테고리

```text
top / outer / bottom / dress / shoes / hair / accessory
```

가방은 `accessory`의 하위 분류다. 실제 목록과 렌더 순서는 각각 `constants/itemCatalog.ts`, `constants/items.ts`를 단일 진실 공급원으로 사용한다.

## 파일명과 저장 위치

```text
assets/avatar/{category}/{category}_###_{color-or-kind}.png
```

예:

- `assets/avatar/top/top_010_cream_knit.png`
- `assets/avatar/shoes/shoes_008_black_loafer.png`
- `assets/avatar/accessory/accessory_006_brown_shoulder_bag.png`

## 제작 워크플로

1. base와 승인된 같은 카테고리 에셋을 스타일·정렬 기준으로 사용한다.
2. full-canvas 레이어 후보를 만든다. 직접 그리지 않을 때는 `$clothic-avatar-pipeline`과 `$imagegen`을 사용한다.
3. 투명도, stray pixel, halo, 어깨·허리·손·발 정렬을 육안 확인한다.
4. `npm run avatar:add -- ... --dry-run`으로 메타데이터와 입력을 검사한다.
5. 승인 후 dry-run을 제거해 등록한다.
6. `npm run avatar:check`, typecheck, lint, 앱 화면 조합 QA를 실행한다.

## 금지

- crop된 의상 이미지를 착장 레이어로 등록
- base와 다른 canvas 또는 비율 사용
- catalog와 asset map을 화면 코드에서 별도로 우회
- 승인 없이 기존 ID에 `--replace` 사용
- ImageGen 결과를 합성 확인 없이 바로 production에 등록
- 출처·도구·프롬프트를 확인할 수 없는 외부 에셋 사용
