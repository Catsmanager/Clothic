# Clothic 아이템 등록/미리보기 플로우

이 문서는 Codex와 Claude Code가 새 옷/신발/하의/상의 에셋을 추가하거나, 아이템 등록 플로우를 수정할 때 반드시 먼저 읽고 따르는 기준입니다.

## 현재 결론

앱에서 `아이템 등록` 화면으로 새 옷을 저장하면 DB에는 아이템 메타데이터가 저장됩니다. 다만 실제 PNG가 모든 미리보기 화면에 자동으로 올라가는 구조는 아닙니다.

- 정적 카탈로그 아이템: `constants/itemCatalog.ts`와 `lib/avatarAssets.ts`에 등록된 PNG는 코디 만들기, 캘린더, 코디 목록/상세, 잠자는 옷장, 통계 TOP 아이템에서 이미지로 보입니다.
- 사용자 등록 아이템: `items.image_path`가 비어 있으면 색상 fallback으로 보입니다.
- 사용자 등록 아이템에 이미지까지 보이게 하려면 `items.image_path`에 `https://`, `file://`, `content://`, `data:image/` 중 하나로 시작하는 렌더 가능한 URI가 저장되어야 합니다.
- 아바타 위에 실제 착장 레이어로 얹으려면 해당 이미지는 기본 아바타와 같은 투명 full-canvas 규격이어야 합니다.

이미지 업로드/크롭/Storage 저장 UI는 아직 구현되지 않았습니다. 이 부분은 확인 필요입니다.

## 공용 렌더링 규칙

아이템 이미지를 직접 화면에서 `require()`하거나 `avatarAssets`를 바로 import하지 않습니다.

- 정사각형/카드 썸네일: `components/ItemPreviewThumb.tsx`
- 아이템 이미지 source/preview style 판정: `lib/itemVisuals.ts`
- 아바타 전체 착장 미리보기: `components/OutfitAvatar.tsx`
- 정적 PNG require/미리보기 보정값: `lib/avatarAssets.ts`

새 화면에서 아이템 썸네일이 필요하면 `ItemPreviewThumb`를 사용합니다. 새 화면에서 코디 전체 아바타가 필요하면 `OutfitAvatar`를 사용합니다.

## 새 정적 옷 에셋 추가 절차

1. PNG 파일을 카테고리 폴더에 저장합니다.

```text
assets/avatar/top/top_###_<color>.png
assets/avatar/bottom/bottom_###_<color>.png
assets/avatar/shoes/shoes_###_<color>.png
```

2. PNG는 아래 조건을 만족해야 합니다.

- 투명 배경
- 기본 아바타와 같은 캔버스 비율
- 착장 위치가 기본 아바타에 맞게 정렬됨
- 검은 배경이 실제 픽셀로 남아 있지 않음

3. `constants/itemCatalog.ts`에 카탈로그 항목을 추가합니다.

- `id`는 파일명 prefix와 일치시킵니다. 예: `bottom_012`
- `category`, `subCategory`, `name`, `color`, `imagePath`, `styleTags`를 채웁니다.

4. `lib/avatarAssets.ts`에 같은 `id`로 source를 등록합니다.

- `source: require('../assets/avatar/...')`
- 정사각형 선택창에서 잘 보이도록 `preview.widthScale`, `preview.heightScale`, `preview.topScale`을 조정합니다.
- full-canvas가 아닌 특수 레이어라면 `layerStyle`도 함께 조정합니다.

5. 화면 파일에는 별도 require를 추가하지 않습니다.

## 반드시 확인할 화면

새 아이템을 추가하거나 미리보기 로직을 바꾼 뒤 아래 화면을 확인합니다.

- 코디 만들기: `app/(tabs)/create.tsx`
  - 하단 선택창 썸네일
  - 아바타 착장 레이어
- 전체 선택창: `app/item-select.tsx`
- 캘린더: `app/(tabs)/calendar.tsx`
  - 월간 셀의 작은 아바타
  - 날짜 선택 시 하단 카드의 아이템 썸네일
- 코디 목록/상세: `app/outfits.tsx`, `app/outfit/[id].tsx`
- 옷장: `app/(tabs)/more.tsx`
  - 잠자는 옷장 리스트 썸네일
- 통계: `app/(tabs)/stats.tsx`
  - 가장 많이 입은 아이템 TOP 5 썸네일

## 사용자 등록 아이템을 이미지로 보이게 하는 조건

사용자 등록 아이템은 Supabase `items` 테이블의 `image_path` 값을 통해 이미지 source를 얻습니다.

허용되는 값:

```text
https://...
file://...
content://...
data:image/...
```

주의:

- `assets/avatar/top/foo.png` 같은 문자열 경로는 런타임 `Image` source가 될 수 없습니다. 정적 앱 번들 에셋은 반드시 `lib/avatarAssets.ts`에서 `require()`로 등록해야 합니다.
- Supabase Storage를 쓰는 경우 `image_path`에는 public URL 또는 앱에서 접근 가능한 signed URL을 저장합니다.
- 아바타 착장용 이미지는 thumbnail crop이 아니라 기본 아바타와 정렬된 투명 full-canvas여야 합니다.

## 검증 명령

코드 변경 후 최소 아래를 실행합니다.

```bash
npm run typecheck
npx prettier --check <changed-files>
```

Expo web까지 확인할 수 있으면 아래도 실행합니다.

```bash
npx expo export --platform web --output-dir /private/tmp/clothic-web-export --clear
```

## 에이전트 체크리스트

- [ ] 이 문서를 먼저 읽었다.
- [ ] 화면에서 `avatarAssets`를 직접 import하지 않았다.
- [ ] 정적 에셋이면 `itemCatalog.ts`와 `avatarAssets.ts`를 모두 갱신했다.
- [ ] 사용자 등록 이미지라면 `image_path`가 렌더 가능한 URI인지 확인했다.
- [ ] 코디 만들기/캘린더/옷장/통계 중 영향 받는 화면을 확인했다.
- [ ] 타입체크와 포맷 체크를 통과했다.
