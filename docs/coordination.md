# Elvis.cafe Coordination Notes

This file tracks the current direction for the MVP while multiple worktrees are active.

## Current Baseline

- Next.js App Router with TypeScript, Tailwind CSS, ESLint.
- Full-screen Elvis-inspired music room.
- Generated original hero asset at `public/images/elvis-cafe-stage.png`.
- Local player shell with station metadata, play/pause, previous/next, shuffle, volume, fullscreen, and About modal.
- Pomodoro, shortcuts/help, disable-shortcuts toggle, share/source controls, low-power mode, visual modes, persistent preferences, PWA manifest, CI, and a minimal test harness.
- Lightweight YouTube embed support exists through public env vars. A richer player API wrapper and automatic skip fallback are still open.

## lofi.cafe Inspiration To Adapt

Reference behavior observed on 2026-06-10:

- Minimal first screen with `listening now` and `press any key to start`.
- Hidden YouTube player behind custom controls.
- Broken/private station fallback message and skip behavior.
- Top-right utility controls: fullscreen, share, timer, about.
- Pomodoro panel with `25:00`, `Start`, and `+5:00`.
- About/help panel lists shortcuts and includes a disable-shortcuts checkbox.
- Shortcuts include station changes, play/pause, tweet/share, visual changes, original video, low-power mode, and Escape close.

Elvis.cafe should adapt the interaction model, not copy the assets or exact UI.

## Issue Map

- #4: YouTube playlist integration and station health fallback.
- #5: Responsive QA and polish.
- #6: Pomodoro focus timer.
- #7: Keyboard shortcuts and help panel.
- #8: Low-power and visual modes.
- #9: Social sharing and metadata polish.
- #10: CI and deployment readiness.
- #11: AI visual asset pipeline and scene variants.
- #12: Station catalog and source data model.
- #13: Accessibility audit and keyboard/screen-reader polish.
- #14: Automated test and QA harness.
- #15: PWA install and local preferences.
- #16: Original video/source link.
- #17: Confirm or replace bundled display font.

## Suggested Merge Order

1. Keep coordinator baseline green.
2. Merge CI/docs and asset-pipeline docs first if they only touch `.github/` and docs.
3. Station data model (#12), source-link (#16), metadata/share (#9), PWA preferences (#15), CI (#10), and tests (#14) are implemented in the coordinator baseline.
4. Merge metadata/share (#9), PWA preferences (#15), and source-link (#16) only after checking whether they touch the same player controls.
5. Merge Pomodoro/shortcuts (#6/#7), accessibility (#13), and visual modes (#8) carefully because they may all touch `components/elvis-cafe.tsx`.
6. Keep tests updated through later merges.
7. Merge any additional visual assets (#11) after confirming size/performance.
8. Merge font licensing/replacement (#17) independently before release.
9. Merge YouTube integration (#4) last, after player UI decisions stabilize.

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
