# Elvis.cafe Roadmap

The goal is a simple, polished Elvis-themed music web app inspired by lofi.cafe, built with Next.js, TypeScript, Tailwind CSS, and a configurable YouTube-backed station model.

## MVP Complete Means

- The app opens directly into the listening experience, not a marketing landing page.
- The first screen has a strong original Elvis/Vegas/Memphis-inspired visual identity.
- Users can start playback with a click or key press.
- Player controls are clear, keyboard reachable, and stable on desktop and mobile.
- Stations are configured as typed data, not hard-coded into UI components.
- YouTube playback can be configured; unavailable sources show status and auto-skip to a bounded fallback path when the IFrame API reports a clear source failure.
- Utility features from lofi.cafe are adapted where useful: Pomodoro, shortcuts/help, low-power mode, share/source actions.
- The app has basic CI, tests, metadata, PWA manifest, and documentation.

## Priority Tracks

1. **Foundation**
   - Completed: Next.js, TypeScript, Tailwind, lint/build, original visual shell.
   - Completed: CI and test command.

2. **Player and Stations**
   - Complete typed station catalog.
   - Completed: typed source URL handling in station metadata.
   - Completed: lightweight YouTube playlist/video embed integration through public env vars.
   - Completed: automatic skip fallback for clear YouTube unavailable/private/embed-blocked failures.
   - Still needed: richer YouTube player API controls.

3. **Interaction Layer**
   - Completed: Pomodoro panel.
   - Completed: Keyboard shortcuts and help.
   - Completed: Disable shortcuts toggle.
   - Completed: Persistent preferences for safe local settings.

4. **Visual Layer**
   - Completed: Low-power mode.
   - Completed: Visual mode variations.
   - Additional AI-generated scene variants.
   - Mobile/desktop polish.

5. **Shipping Layer**
   - Completed: Metadata and share flow.
   - Completed: PWA manifest.
   - Accessibility audit.
   - Deployment notes.

## Current Risk Areas

- Several workers may touch `components/elvis-cafe.tsx`; merge order matters.
- Issue #17 resolved the provisional bundled display font by replacing it with `@fontsource/bebas-neue`, an `OFL-1.1` licensed npm package.
- Real Elvis music should come from user-configured YouTube sources or licensed audio only.
- YouTube embeds require user interaction before playback and must handle unavailable videos.

## Verification Before Release

Use these gates after every merged slice:

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

When tests are added, include the test command in this gate. UI changes also need screenshots for:

- Desktop start state.
- Desktop playing state.
- Mobile start state.
- Mobile playing state.
- Any new modal or utility panel.
