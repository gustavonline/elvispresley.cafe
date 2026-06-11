# elvispresley.cafe

A small Next.js demo for an Elvis-inspired music cafe: full-screen retro visuals, CRT treatment, minimal controls, and a station shell ready for a YouTube playlist integration.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run lint
npm run test
npm run build
```

## Music configuration

Station data lives in `lib/stations.ts`. The demo uses safe placeholder station metadata, and can also expose a configured YouTube station through public environment variables:

```bash
NEXT_PUBLIC_ELVIS_YOUTUBE_VIDEO_ID=VIDEO_ID
NEXT_PUBLIC_ELVIS_YOUTUBE_PLAYLIST_ID=PLAYLIST_ID
```

The current YouTube path uses a lightweight hidden embed after user interaction. A fuller player API wrapper can wire the custom play/pause controls more tightly later. Real Elvis music should be configured through YouTube or licensed audio sources rather than bundled into this repo.

## Features

- Press any key or click to start.
- Play/pause, previous/next, shuffle, volume, fullscreen.
- Pomodoro panel with 25:00, start/pause, reset, and +5:00.
- Keyboard shortcuts listed in the About panel.
- Low-power mode and visual mode switching.
- Station sharing with Web Share API or clipboard fallback.
- PWA manifest and persistent safe preferences.
- CI workflow for install, lint, test, build, and audit.

## Visual asset

`public/images/elvis-cafe-stage.png` was generated as an original project asset with this prompt:

> Create an original retro rock-and-roll cafe background inspired by 1950s Memphis and neon Las Vegas, suitable for an Elvis-themed music listening app. Do not depict Elvis Presley directly and do not include a recognizable celebrity face. Nighttime stage cafe with a vintage jukebox, gold microphone stand, red velvet curtains, blue and pink neon signs, subtle Memphis street/cafe details, warm spotlights, polished checkerboard floor, distant marquee lights. High-quality pixel-art / retro game background, cinematic, atmospheric, rich but not cluttered, full-bleed 16:9 composition, darker edges for UI readability. No readable text, no logos, no watermark.

## Font licensing

The display typeface is Bebas Neue via `@fontsource/bebas-neue`. It is distributed under the SIL Open Font License 1.1 (`OFL-1.1`), which is suitable for bundling and web redistribution. Fontsource keeps the web font files inside the npm package so the app can self-host the font during deployment without committing a separate font binary to `public/`.

## Coordination

See `docs/roadmap.md` for the product roadmap and release criteria. See `docs/coordination.md` for the current issue map, lofi.cafe inspiration notes, worker-thread merge order, and verification gates.
