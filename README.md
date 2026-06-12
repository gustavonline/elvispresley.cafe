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

Station data lives in `lib/stations.ts`. The jukebox includes five YouTube-backed Elvis stations: Greatest Hits, Christmas Elvis, On Tour, Elvis 101, and Love Songs. Each station carries its own scene, color treatment, and player glow so the room changes with the selected playlist.

Open http://localhost:3000, start the cafe, and use the dock controls. Browser autoplay rules still require the initial user start gesture, and YouTube availability can vary by video, embedding policy, region, or network. When the IFrame API reports a source as unavailable, private, invalid, or blocked from embedding, the app shows a concise fallback status and automatically skips to that station's `fallbackStationId`. If that fallback is missing or was already tried in the same auto-skip chain, the app moves to the next unattempted station instead. Auto-skip attempts are bounded to one pass through the station list so a broken set of YouTube sources cannot loop endlessly.

This fallback depends on errors surfaced by the YouTube IFrame API or API load failures. Some network stalls, regional restrictions, ad states, or normal video endings may not produce a reliable unavailable event, so they are reported through the player status line when possible instead of being guessed.

Real Elvis music is embedded through YouTube or should come from licensed audio sources rather than bundled into this repo.

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
