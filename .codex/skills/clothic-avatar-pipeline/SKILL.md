---
name: clothic-avatar-pipeline
description: Generate, inspect, validate, and safely register Clothic full-canvas avatar clothing, hair, shoes, and accessory PNG layers. Use when adding or replacing files under assets/avatar, creating avatar assets without hand drawing through ImageGen, updating itemCatalog/avatarAssets metadata, diagnosing avatar alignment or transparency, or running the avatar asset quality gate.
---

# Clothic Avatar Pipeline

Create avatar candidates with AI assistance, but treat generation as a draft step and deterministic validation plus human visual approval as the release gate.

## Read the contract

Read these project files before changing an asset:

1. `docs/PRD.md`
2. `docs/ITEM_ASSET_FLOW.md`
3. `docs/AVATAR_ASSET_PIPELINE.md`
4. `references/style-and-prompt.md` from this skill

Use `assets/avatar/base/base_female_01.png` as the canonical alignment reference. Derive the canvas from that file; the current contract is 1024×1536 RGBA.

## Choose a path

- For a supplied full-canvas transparent PNG, skip generation and start at validation.
- For a new asset without hand drawing, invoke `$imagegen` and follow its built-in-first workflow. Use the base plus the closest approved same-category layer as references, then use the prompt recipe in `references/style-and-prompt.md`.
- For a style exploration, keep outputs outside the catalog until the user approves one.
- For hair, fur, translucent fabric, or difficult edges, follow `$imagegen` transparency rules and request confirmation before any CLI/native-transparency fallback.

Do not use an external avatar engine as a silent replacement for Clothic's established full-body style. Do not add AI outfit recommendation or user photo upload; both are outside the current MVP.

## Generate without drawing

1. Inspect the base and one or two approved same-category layers with `view_image`.
2. Generate one candidate at a time at 1024×1536.
3. Request only the target layer on a perfectly flat chroma-key background. Exclude the body, face, other garments, text, logos, watermarks, shadows, and scenery. Exclude hair unless hair is the requested category.
4. Remove the chroma key exactly as directed by `$imagegen`.
5. Save the alpha PNG under `assets/staging/`. Do not overwrite a registered asset.
6. Inspect the candidate on transparency and in the app over the base. Reject shifted shoulders, waist, hands, feet, stray pixels, color halos, style drift, or extra objects.

ImageGen is a candidate generator, not an alignment guarantee. Prefer three small category pilots and freeze the prompt/style rules before batch production.

## Validate and register

Choose metadata that already follows `constants/items.ts`:

- ID: `{category}_###`
- category: `top`, `outer`, `bottom`, `dress`, `shoes`, `hair`, or `accessory`
- style tags: values from `STYLE_TAGS`
- seasons: `spring`, `summer`, `fall`, `winter`, or `all`

Run a dry-run first:

```bash
npm run avatar:add -- \
  --source assets/staging/top_010_cream_knit.png \
  --id top_010 \
  --category top \
  --subCategory 니트 \
  --name "크림 니트" \
  --color "#E8DDC8" \
  --colorKey cream_knit \
  --styles casual,minimal \
  --seasons spring,fall,winter \
  --preview-from top_009 \
  --dry-run
```

For a new ID, `--preview-from` must name a different approved item in the same category; the registration command copies its thumbnail placement metadata. Register only after approval by rerunning without `--dry-run`. Pass `--replace` only when the user explicitly intends to replace an existing ID or file.

The registration command must synchronize:

- `assets/avatar/{category}/...png`
- `constants/itemCatalog.ts`
- `constants/items.ts`
- `lib/avatarAssets.ts`

It validates PNG structure/CRC, exact canvas, 8-bit RGBA decoding, and real visible/transparent
pixels; prepares all edits before writing; runs the repository asset checker; and rolls back on
failure.

## Release gate

Run:

```bash
npm run avatar:check
npm run typecheck
npm run lint
npm run format:check
```

Then verify the affected category in:

- the compact picker and full item picker
- the outfit editor over the base
- calendar, saved outfit detail, wardrobe, and statistics thumbnails

Report the source/generation method, final prompt when ImageGen was used, file path, item metadata, checks, visual QA, and any remaining manual approval. Never claim an asset is production-ready from metadata checks alone.
