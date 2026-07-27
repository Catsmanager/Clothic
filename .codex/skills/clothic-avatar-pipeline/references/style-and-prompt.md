# Clothic avatar style and ImageGen prompt

## Canonical contract

- Canvas: 1024×1536 pixels (2:3)
- Format: PNG, 8-bit RGBA, transparent outside the layer
- Placement: preserve the exact pose and landmarks of `assets/avatar/base/base_female_01.png`
- Output: a full-canvas wearable layer, never a cropped catalog image
- Visual style: polished semi-pixel fashion illustration with crisp stepped edges, warm gray-brown outlines, restrained two-to-four-tone shading, and soft neutral colors
- Avoid: photorealism, 3D rendering, thick chibi pixels, hard pure-black outlines, blur, texture noise, cast shadows, anatomy, body pixels, other garments, text, logos, and watermarks

Use the closest approved layer in the same category as the style reference. Do not use `base_female_01_mosaic.png` as a neutral base reference because it is a dressed placeholder.

Choose `<KEY_COLOR>` using `$imagegen` rules: default to `#00ff00`, but use `#ff00ff` when the requested item contains green or green-adjacent colors. Use the same selected key in every prompt constraint and in chroma removal.

## Prompt recipe

```text
Use case: stylized-concept
Asset type: Clothic mobile avatar full-canvas wearable PNG layer
Primary request: create <ITEM DESCRIPTION> as a clothing-only overlay aligned exactly to the Clothic base avatar
Input images:
- Image 1: placement reference only; preserve its 1024×1536 canvas, front-facing pose, shoulder, waist, hand, and foot landmarks; do not render the body
- Image 2: approved style reference; match its semi-pixel edge scale, warm outline, palette discipline, and shading density
Scene/backdrop: perfectly flat solid <KEY_COLOR> chroma-key background for removal
Subject: only <ITEM DESCRIPTION>, positioned where it would sit on the referenced body
Style/medium: polished semi-pixel 2D fashion-game layer, crisp stepped edges, warm gray-brown outline, restrained two-to-four-tone shading
Composition/framing: exact 1024×1536 portrait canvas; keep all original transparent margins; do not center-crop or enlarge the item
Color palette: <COLOR AND MATERIAL>
Constraints: clothing/accessory pixels only; exact front view; symmetric unless the design requires asymmetry; no cast shadow; no contact shadow; no guide pixels
Avoid: body, skin, face, hair unless hair is the requested category, underwear, other garments, props, background details, gradients in the key color, <KEY_COLOR> in the item, text, logo, watermark, blur, photorealism, 3D
```

Append the standard chroma-key constraints from `$imagegen`. For a revision, change one variable only and repeat every invariant.

## Acceptance checklist

- Match 1024×1536 and include usable alpha.
- Keep shoulders, waist, hands, and feet aligned with the base.
- Keep unrelated body areas fully transparent.
- Show no green fringe, detached speckles, unexpected shadow, or clipped edge.
- Match the nearest approved layer's outline weight and shading density.
- Render correctly with at least one top/bottom/shoes combination and with no conflicting layer.
- Confirm the name, category, color, style tags, seasons, and source/provenance before registration.
