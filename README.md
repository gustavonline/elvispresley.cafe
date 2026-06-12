# elvispresley.cafe

A small Vite + React + TanStack Router app for an Elvis-inspired music cafe: full-screen retro visuals, CRT treatment, minimal controls, and YouTube playlist-backed jukebox stations.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## Scripts

```bash
npm run lint
npm run test
npm run qa:visual
npm run build
npm run preview
```

The production app is static. `npm run build` writes `dist/`, and `npm run preview` serves that build locally for smoke testing before hosting.

## Music configuration

Station data lives in `lib/stations.ts`. The jukebox includes five YouTube-backed Elvis stations: Greatest Hits, Christmas Elvis, On Tour, Elvis 101, and Love Songs. Each station carries its own scene list, color treatment, and player glow so the room changes with the selected playlist. When playback and motion mode are active, the station rotates through its scenes on a calm timed cadence.

Start the cafe and use the dock controls. Browser autoplay rules still require the initial user start gesture, and YouTube availability can vary by video, embedding policy, region, or network. When the IFrame API reports a source as unavailable, private, invalid, or blocked from embedding, the app shows a concise fallback status and automatically skips to that station's `fallbackStationId`. If that fallback is missing or was already tried in the same auto-skip chain, the app moves to the next unattempted station instead. Auto-skip attempts are bounded to one pass through the station list so a broken set of YouTube sources cannot loop endlessly.

This fallback depends on errors surfaced by the YouTube IFrame API or API load failures. Some network stalls, regional restrictions, ad states, or normal video endings may not produce a reliable unavailable event, so they are reported through the player status line when possible instead of being guessed.

Real Elvis music is embedded through YouTube or should come from licensed audio sources rather than bundled into this repo.

## Features

- Press any key or click to start.
- Play/pause, previous/next, shuffle, volume, fullscreen.
- Pomodoro panel with 25:00, start/pause, reset, and +5:00.
- Keyboard shortcuts listed in the About panel.
- Background motion toggle for a subtle living-room effect.
- Station sharing with Web Share API or clipboard fallback.
- PWA manifest and persistent safe preferences.
- CI workflow for install, lint, test, build, and audit.

## Visual assets

The station backgrounds in `public/images/station-*.png` are original generated project assets. They use the Elvis groovy palette as scene lighting and decor, while avoiding Elvis Presley likenesses, celebrity faces, logos, readable text, copied lofi.cafe assets, and copyrighted poster art.

Prompt details and asset provenance live in `docs/visual-assets.md`.

## Font licensing

The display typeface is Bebas Neue via `@fontsource/bebas-neue`. It is distributed under the SIL Open Font License 1.1 (`OFL-1.1`), which is suitable for bundling and web redistribution. Fontsource keeps the web font files inside the npm package so the app can self-host the font during deployment without committing a separate font binary to `public/`.

## Coordination

See `docs/roadmap.md` for the product roadmap and release criteria. See `docs/coordination.md` for the current issue map, lofi.cafe inspiration notes, worker-thread merge order, and verification gates. See `docs/deployment.md` for static deployment notes.
