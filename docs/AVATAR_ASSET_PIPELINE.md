# Avatar Asset Pipeline

## Goal

Add avatar clothing layers with one command, keeping these files in sync:

- `assets/avatar/{category}/...png`
- `constants/itemCatalog.ts`
- `constants/items.ts`
- `lib/avatarAssets.ts`

## Required Source Image

- PNG with transparent background
- Same alignment as `assets/avatar/base/base_female_01.png`
- Full avatar canvas, not a cropped clothing thumbnail
- Recommended source ratio: `1:2`

The pipeline normalizes the final clothing asset to the current base avatar size.
Right now that means matching `assets/avatar/base/base_female_01.png`.

## Add An Item

```bash
npm run avatar:add -- \
  --source assets/raw/black_sleeveless.png \
  --id top_011 \
  --category top \
  --subCategory 나시 \
  --name "블랙 민소매 2" \
  --color "#1C1C1C" \
  --colorKey black \
  --styles minimal,chic
```

This creates:

```text
assets/avatar/top/top_011_black.png
```

It also registers the item so it appears in the picker and can render on the avatar.

## Alignment

The best source file is already aligned to the base avatar. Use this workflow:

1. Put `base_female_01.png` as a guide layer in the editor.
2. Place the clothing on the body.
3. Hide the base layer.
4. Export the clothing layer only, keeping the full transparent canvas.

If a source is slightly off, add a temporary `layerStyle` override in `lib/avatarAssets.ts`.
That is useful for small nudges, but a correctly aligned PNG is still the final target.

## Check Registered Assets

```bash
npm run avatar:check
```

The check verifies every mapped clothing layer is:

- present on disk
- the same size as `assets/avatar/base/base_female_01.png`
- PNG with alpha

## Notes

If an item should replace an existing catalog entry, reuse the same `--id`.
For example, replacing the first black sleeveless top:

```bash
npm run avatar:add -- \
  --source assets/new_top.png \
  --id top_001 \
  --category top \
  --subCategory 나시 \
  --name "블랙 민소매" \
  --color "#1C1C1C" \
  --colorKey black \
  --styles minimal,chic
```
