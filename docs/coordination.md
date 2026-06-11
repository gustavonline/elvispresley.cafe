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

- #4: YouTube playlist integration. Closed in main; automatic fallback remains #20.
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
- #18: Create visual scene pack with AI image or loop variants.
- #19: Add station catalog drawer and station selection flow.
- #20: Add station health fallback and auto-skip behavior.
- #21: Add mobile viewport and touch-control polish pass.
- #22: Prepare Vercel demo deployment and environment setup docs.
- #23: Polish about/help overlay with credits, shortcuts, and source safety.
- #24: Run lofi.cafe parity QA and close MVP gaps.

## Active Worker Threads

- #4 YouTube player API: merged in main via `fcbc300`; worker thread `019eb7fb-4178-75a1-b86c-ad3fbbd63634`.
- #13 accessibility: merged in main via `763566a`; worker thread `019eb7fb-6dbd-74b2-9a43-2d2f5f11f9cd`.
- #17 font licensing: `019eb7fb-9f0c-7972-906d-de83a8d3c559`, worktree `/Users/gustavanderson/.codex/worktrees/82a8/elvispresley.cafe`.
- #18 visual scene pack: `019eb7fb-d703-7233-a4e4-5651b4b2b8ba`, worktree `/Users/gustavanderson/.codex/worktrees/5b5d/elvispresley.cafe`.

Worker setup should start from committed `main`, not from an uncommitted working-tree diff. The prior worktree setup failure was caused by binary files in an unstaged patch.

## Suggested Merge Order

1. Keep coordinator baseline green.
2. Font licensing/replacement (#17) is merged in main and removes the redistribution risk.
3. Accessibility (#13) is merged in main. Preserve the focus-managed Timer/About behavior in later UI work.
4. YouTube integration (#4) is merged in main. Future player work should build on `lib/youtube.ts` and the `YouTubePlayerHost` status hooks.
5. Merge visual scene pack (#18) after checking asset size and screenshot framing.
6. Add station drawer (#19) after #4 if the player state API changes.
7. Add station fallback/auto-skip (#20) after #4, using the player events/status it exposes.
8. Run mobile polish (#21), deployment docs (#22), about/help polish (#23), and parity QA (#24) as final release passes.

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
