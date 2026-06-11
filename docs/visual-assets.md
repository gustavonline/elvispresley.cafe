# Visual Asset Pipeline

Issue #18 adds an original station scene pack. The app keeps the legacy generated baseline at `public/images/elvis-cafe-stage.png`, and each demo station now selects one optimized scene from station metadata.

## Rules

- Keep assets original.
- Avoid direct Elvis Presley likenesses, celebrity faces, logos, trademarks, and copied source images.
- Store project assets under `public/images`.
- Document prompts in README or this file.
- Prefer still images plus CSS treatment before GIF/video backgrounds; it is simpler, smaller, and easier to keep responsive.

## Scene Pack

All scene-pack assets were generated with the built-in image generation tool on 2026-06-11 from original prompts. No source images, celebrity references, logos, copied lofi.cafe assets, or readable copyrighted text were used.

Optimized project copies:

- `public/images/elvis-cafe-sun-studio.jpg`: 1600 x 900 JPEG, 240 KB.
- `public/images/elvis-cafe-vegas-jukebox.jpg`: 1600 x 900 JPEG, 376 KB.
- `public/images/elvis-cafe-graceland-lounge.jpg`: 1600 x 900 JPEG, 356 KB.

Original generated PNGs are retained by Codex under `/Users/gustavanderson/.codex/generated_images/019eb7fb-d703-7233-a4e4-5651b4b2b8ba/`. Project copies were resized and converted with `sips -s format jpeg -s formatOptions 78 --resampleWidth 1600`.

### Sun Studio After Dark

Prompt:

```text
Use case: stylized-concept
Asset type: full-bleed 16:9 web background for elvispresley.cafe station scene
Primary request: Create an original Elvis-inspired but legally safe Memphis studio stage scene for a music cafe app.
Scene/backdrop: small 1950s-inspired recording studio stage after dark, red velvet curtain, one vintage chrome microphone on a stand with no performer, warm amber spotlights, checkerboard floor, guitar cases as abstract silhouettes, analog tape machine glow in the background.
Subject: Empty atmospheric stage, no people, no celebrity likeness, no Elvis Presley depiction.
Style: polished cinematic digital painting with subtle grain, moody lofi cafe ambience, rich depth, web hero composition.
Composition: landscape 16:9, main visual interest slightly left of center, enough dark negative space near center for overlaid title text, full-bleed object-cover friendly framing for desktop and mobile crops.
Palette: warm crimson, amber gold, deep black, small teal highlights.
Avoid: Elvis Presley face or body, celebrity likeness, logos, trademarks, readable text, copyrighted posters, copied lofi.cafe assets, watermark, signatures.
```

### Vegas Midnight Jukebox

Prompt:

```text
Use case: stylized-concept
Asset type: full-bleed 16:9 web background for elvispresley.cafe station scene
Primary request: Create an original Elvis-inspired but legally safe Las Vegas midnight jukebox lounge scene for a music cafe app.
Scene/backdrop: empty lounge corner with a chrome retro jukebox, abstract neon strips, velvet booth seating, reflective black tile floor, gold trim, soft haze, distant stage lights, no posters or signage.
Subject: Jukebox and lounge atmosphere only, no people, no celebrity likeness, no Elvis Presley depiction.
Style: polished cinematic digital painting with subtle grain, glamorous late-night lofi cafe ambience, original composition.
Composition: landscape 16:9, jukebox on right third, open darker center-left for overlaid title text, full-bleed object-cover friendly framing for desktop and mobile crops.
Palette: electric cyan, hot pink, gold, black, restrained red accents.
Avoid: Elvis Presley face or body, celebrity likeness, logos, trademarks, readable text, copyrighted posters, copied lofi.cafe assets, watermark, signatures.
```

### Graceland Gold Hour

Prompt:

```text
Use case: stylized-concept
Asset type: full-bleed 16:9 web background for elvispresley.cafe station scene
Primary request: Create an original Elvis-inspired but legally safe golden-hour Memphis music lounge scene for a music cafe app.
Scene/backdrop: empty refined Southern music lounge, sunlit gold curtains, vintage floor lamp, small piano bench without performer, brass instrument silhouettes, framed abstract gold records with no labels, soft dust in light beams, patterned rug.
Subject: Calm lounge interior only, no people, no celebrity likeness, no Elvis Presley depiction.
Style: polished cinematic digital painting with subtle grain, warm nostalgic lofi cafe ambience, original composition.
Composition: landscape 16:9, warm lamp and seating on left, open softly lit middle for overlaid title text, enough detail at edges for mobile cropping, full-bleed object-cover friendly.
Palette: honey gold, burgundy, cream highlights, dark walnut, muted teal accent.
Avoid: Elvis Presley face or body, celebrity likeness, logos, trademarks, readable text, copyrighted posters, copied lofi.cafe assets, watermark, signatures.
```

## Performance Notes

- Still image plus CSS scanlines/noise is the default.
- GIF backgrounds should be avoided unless short and heavily optimized.
- Video backgrounds need a low-power fallback and should not be required for the core experience.
- Low-power mode keeps using the same still image path and only reduces overlay motion/intensity.
