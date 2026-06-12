# Static Deployment

The app is a Vite + React + TanStack Router static build. It does not require a server runtime.

## Build

```bash
npm ci
npm run lint
npm run test
npm run build
```

The production output is written to `dist/`.

## Local Preview

```bash
npm run preview
```

Vite serves the already-built `dist/` directory. Use this for a final local smoke test before deploying.

## Hosting Requirements

- Serve `dist/` as static files.
- Preserve the root URL `/` for the app shell.
- Serve files from `public/` at the site root, including `/manifest.webmanifest`, `/icon.svg`, and `/images/*`.
- Do not require a Node server in production.

## Playback Notes

The YouTube IFrame API still requires a user gesture before playback. Some videos may be unavailable because of region, privacy, embedding policy, or network restrictions; the app handles clear unavailable events by auto-skipping through the station fallback path.
