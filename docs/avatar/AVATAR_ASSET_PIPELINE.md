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
- Exact current canvas: `1024x1536` (`2:3`)

The pipeline validates against the current base avatar. It does not force-resize a cropped or
misaligned source because that can distort the garment.

## Add An Item

```bash
npm run avatar:add -- \
  --source assets/staging/black_sleeveless.png \
  --id top_011 \
  --category top \
  --subCategory 나시 \
  --name "블랙 민소매 2" \
  --color "#1C1C1C" \
  --colorKey black \
  --styles minimal,chic \
  --seasons summer \
  --preview-from top_009 \
  --dry-run
```

Remove `--dry-run` after reviewing the plan. This creates:

```text
assets/avatar/top/top_011_black.png
```

It also registers the item so it appears in the picker and can render on the avatar. Existing IDs
or paths require the explicit `--replace` flag. New IDs require `--preview-from` pointing to an
approved item in the same category.

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
- valid non-interlaced 8-bit RGBA PNG with decodable pixels and real transparency
- matched to its category/id directory and filename
- synchronized 1:1 across the catalog, static asset map, and files on disk
- free of duplicate IDs/paths and unregistered layer PNGs

The scripts use Node's PNG parser and work on macOS and Linux without `sips`.

## Generate Without Hand Drawing

Use the project skill:

```text
$clothic-avatar-pipeline
```

The skill uses `$imagegen` with the base and an approved same-category layer as references, removes
a flat chroma key, validates the full canvas, and requires visual approval before registration.
Image generation produces candidates; it does not guarantee pixel-perfect alignment.

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
  --styles minimal,chic \
  --seasons summer \
  --replace \
  --dry-run
```
