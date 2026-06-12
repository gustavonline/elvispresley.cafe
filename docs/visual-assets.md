# Visual Asset Pipeline

Issue #18 added the first original station scene pack. Issue #29 replaces the station backgrounds with a dedicated generated scene for each jukebox station, using the Elvis groovy palette as scene lighting instead of a UI overlay.

## Rules

- Keep assets original.
- Avoid direct Elvis Presley likenesses, celebrity faces, logos, trademarks, and copied source images.
- Store project assets under `public/images`.
- Document prompts in README or this file.
- Prefer still images plus CSS motion treatment before GIF/video backgrounds; it is simpler, smaller, and easier to keep responsive.

## Dedicated Station Scene Pack

Dedicated station assets were generated with the built-in image generation tool on 2026-06-12 from original prompts. No source images, celebrity references, logos, copied lofi.cafe assets, or readable copyrighted text were used.

Project copies:

- `public/images/station-greatest-hits.png`: RCA-era jukebox room with gold records and velvet curtains.
- `public/images/station-greatest-hits-alt.png`: alternate RCA-era record lounge angle for rotation.
- `public/images/station-christmas-elvis.png`: warm winter holiday lounge with cream lamps, ornaments, and a small empty stage.
- `public/images/station-christmas-elvis-alt.png`: alternate winter record lounge angle for rotation.
- `public/images/station-on-tour.png`: vintage tour bus and concert-road scene.
- `public/images/station-on-tour-alt.png`: alternate backstage tour-road scene for rotation.
- `public/images/station-elvis-101.png`: curated record-shelf listening room.
- `public/images/station-elvis-101-alt.png`: alternate record archive listening room for rotation.
- `public/images/station-love-songs.png`: velvet slow-dance lounge with moonlit stage.
- `public/images/station-love-songs-alt.png`: alternate romantic velvet lounge angle for rotation.

Original generated PNGs are retained by Codex under `/Users/gustavanderson/.codex/generated_images/019eb2d3-346f-7ce3-8fb6-1a9b4c41fe95/`.

Shared prompt constraints:

```text
Use case: stylized-concept
Asset type: full-bleed 16:9 web background for an Elvis-inspired music cafe station
Style/medium: polished cinematic retro illustration with groovy 1950s-1970s influence, high detail, suitable as a full-screen app background.
Composition/framing: wide 16:9 landscape with darker edges and lower area for UI readability, enough visible detail for thumbnails.
Color palette: #f4c41a gold, #f4648a small accent, #655414 shadow, #aa4c64 velvet, #d4bc9c cream, #5e303c plum-dark base.
Constraints: no readable text, no logos, no watermark, no celebrity likeness, no face, no Elvis costume, no copyrighted poster art.
```

Station-specific prompt direction:

- Greatest Hits: empty 1950s-inspired music cafe with chrome jukebox, gold record shapes, velvet curtains, checkerboard floor, and warm haze.
- Christmas Elvis: empty holiday rock-and-roll lounge with winter window, ornaments, garland, vinyl records, cream lamp glow, and no red/green dominance.
- On Tour: empty vintage tour bus parked outside a small glowing theater at dusk, chrome microphone case, guitar case silhouettes, and distant stage bulbs.
- Elvis 101: empty record-library listening room with vinyl shelves, turntable, cream chairs, abstract gold records, and a small vintage microphone stand.
- Love Songs: empty romantic velvet lounge with curved booths, moonlit window, gold microphone stand, roses as abstract shapes, and candle-like lamps.

## Legacy Scene Pack

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
- Motion mode uses still-image drift, a subtle gold light sweep, and scene crossfade instead of video or GIF loops.
- GIF backgrounds should be avoided unless short and heavily optimized.
- Video backgrounds need a low-power fallback and should not be required for the core experience.
- Motion mode should keep a still-image fallback and respect reduced-motion preferences.
