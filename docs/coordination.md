# Elvis.cafe Coordination Notes

This file tracks the current direction for the MVP while multiple worktrees are active.

## Current Baseline

- Vite + React with TanStack Router, TypeScript, Tailwind CSS, ESLint.
- Full-screen Elvis-inspired music room.
- Generated original station scenes wired through `Station.imageSrc`.
- Local player shell with minimal station metadata, station picker, play/pause, previous/next, shuffle, volume, source, fullscreen, and About modal.
- Station catalog opens from the player dock as a jukebox modal with image cards, names, and direct selection.
- Pomodoro, shortcuts/help, disable-shortcuts toggle, share/source controls, background motion toggle, persistent preferences, PWA manifest, CI, and a minimal test harness.
- YouTube IFrame API support exists through typed Elvis playlist stations. Clear unavailable/private/embed-blocked source failures now auto-skip through a bounded fallback path.

## lofi.cafe Inspiration To Adapt

Reference behavior observed on 2026-06-10:

- Minimal first screen with `listening now` and `press any key to start`.
- Hidden YouTube player behind custom controls.
- Broken/private station fallback message and skip behavior.
- Top-right utility controls: fullscreen, share, timer, about.
- Pomodoro panel with `25:00`, `Start`, and `+5:00`.
- Station catalog control opens a compact jukebox picker for direct station selection without changing previous/next/shuffle behavior.
- About/help panel lists shortcuts and includes a disable-shortcuts checkbox.
- Shortcuts include station changes, play/pause, share, background motion, original source, fullscreen, and Escape close.

Elvis.cafe should adapt the interaction model, not copy the assets or exact UI.

## Issue Map

- #4: YouTube playlist integration. Closed in main.
- #5: Responsive QA and polish. Closed in baseline.
- #6: Pomodoro focus timer. Closed in baseline.
- #7: Keyboard shortcuts and help panel. Closed in baseline.
- #8: Low-power and visual modes. Closed in baseline.
- #9: Social sharing and metadata polish. Closed in baseline.
- #10: CI and deployment readiness. Closed in baseline.
- #11: AI visual asset pipeline and scene variants. Closed in baseline docs.
- #12: Station catalog and source data model. Closed in baseline.
- #13: Accessibility audit and keyboard/screen-reader polish. Closed in main.
- #14: Automated test and QA harness. Closed in baseline.
- #15: PWA install and local preferences. Closed in baseline.
- #16: Original video/source link. Closed in baseline.
- #17: Replaced bundled display font with `@fontsource/bebas-neue` (`OFL-1.1`). Closed in main.
- #18: Create visual scene pack with AI image or loop variants. Closed in main.
- #19: Add station catalog drawer and station selection flow. Closed in main.
- #20: Add station health fallback and auto-skip behavior. Closed in main.
- #21: Add mobile viewport and touch-control polish pass.
- #22: Prepare static demo deployment and environment setup docs. Closed in main via `docs/deployment.md`.
- #23: Polish about/help overlay with credits, shortcuts, and source safety. Closed in main.
- #24: Run lofi.cafe parity QA and close MVP gaps.
- #25: Add ambient room SFX layer and mute control.
- #26: Add cinematic scene transitions between stations.
- #27: Add station seed data for Elvis-safe public playlists.
- #28: Add screenshot regression and lofi parity QA script.
- #29: Generate dedicated AI scene sets for each Elvis station. Closed in main.
- #30: Rotate multiple station images during playback and song changes.
- #31: Explore lightweight animated scene loops for optional motion mode.

## Active Worker Threads

- #4 YouTube player API: merged in main via `fcbc300`; worker thread `019eb7fb-4178-75a1-b86c-ad3fbbd63634`.
- #13 accessibility: merged in main via `763566a`; worker thread `019eb7fb-6dbd-74b2-9a43-2d2f5f11f9cd`.
- #17 font licensing: merged in main via `3dfd850`; worker thread `019eb7fb-9f0c-7972-906d-de83a8d3c559`.
- #18 visual scene pack: merged in main; worker thread `019eb7fb-d703-7233-a4e4-5651b4b2b8ba`.
- #19 station drawer: merged in main via `3c4f4d6`; worker thread `019eb80a-6f76-7931-bf1e-10263a2a4de9`.
- #20 fallback/auto-skip: merged in main; worker thread `019eb80a-7058-7f10-a1c7-852480bfc6fc`.

Worker setup should start from committed `main`, not from an uncommitted working-tree diff. The prior worktree setup failure was caused by binary files in an unstaged patch.

## Suggested Merge Order

1. Keep coordinator baseline green.
2. Font licensing/replacement (#17) is merged in main and removes the redistribution risk.
3. Accessibility (#13) is merged in main. Preserve the focus-managed Timer/About behavior in later UI work.
4. YouTube integration (#4) is merged in main. Future player work should build on `lib/youtube.ts` and the `YouTubePlayerHost` status hooks.
5. Visual scene pack (#18) is merged in main. Preserve `Station.imageSrc` in later station work.
6. Station drawer (#19) is merged in main. Preserve shared modal/focus helpers in later UI work.
7. Station fallback/auto-skip (#20) is merged in main. Future player work should respect the bounded retry set.
8. Run mobile polish (#21), deployment docs (#22), about/help polish (#23), ambience (#25), transitions (#26), playlist seeding (#27), screenshot regression (#28), and parity QA (#24) as final release passes.

## Verification Gates

Run these before considering a merged slice complete:

```bash
npm run lint
npm run test
npm run build
npm audit --audit-level=moderate
```

For UI slices, also capture desktop and mobile screenshots around:

- Start state.
- Playing state.
- Any modal or utility panel.
