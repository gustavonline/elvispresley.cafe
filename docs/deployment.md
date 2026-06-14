# Static Deployment Plan

The app is a Vite + React + TanStack Router static build. It does not require a server runtime.

## Recommendation

Use GitHub Pages with GitHub Actions for the first free deployment. Vite needs a build step, so the workflow in `.github/workflows/deploy-pages.yml` builds `dist/` and deploys that artifact to Pages.

Current temporary URL before a custom domain is connected:

- https://gustavonline.github.io/elvispresley.cafe/

Sources:

- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Vite static deploy guide: https://vite.dev/guide/static-deploy.html#github-pages

## Build

```bash
npm ci
npm run lint
npm run test
npm run build
```

The production output is written to `dist/`.

## GitHub Pages Setup

1. Push the repository to GitHub.
2. Open the repository settings, then Pages.
3. Under Build and deployment, set Source to GitHub Actions.
4. Run the `Deploy GitHub Pages` workflow, or push to `main`.
5. If you use the default project URL, the app will be served from `https://<user>.github.io/elvispresley.cafe/`; the workflow already builds with `VITE_BASE_PATH=/elvispresley.cafe/`.
6. If the Cloudflare presence worker is deployed, add a repository variable named `VITE_PRESENCE_ENDPOINT` with the worker URL, for example `https://elvis-cafe-presence.<your-workers-subdomain>.workers.dev/presence`.
7. If you connect the custom domain `elvispresley.cafe`, add a repository variable named `VITE_BASE_PATH` with the value `/`, then rerun the workflow.

Do not add a `CNAME` file until the domain is configured in GitHub Pages settings and DNS is pointing at GitHub Pages.

## Live Listener Count

The live listener count uses a small Cloudflare Worker with a Durable Object. GitHub Pages still hosts the frontend; the Worker only stores anonymous active listening sessions.

Why this exists:

- GitHub Pages is static and cannot count active browsers by itself.
- The YouTube iframe player does not expose real-time embedded playlist listener counts.
- The app should not show simulated listener numbers.

Cloudflare references:

- Wrangler deploy command: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
- Durable Objects overview: https://developers.cloudflare.com/durable-objects/
- Durable Objects Wrangler configuration and migrations: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/

### Deploy The Presence Worker

1. Create or log in to a Cloudflare account.
2. Authenticate Wrangler:

```bash
npx wrangler login
```

3. Dry-run the Worker build:

```bash
npm run presence:dry-run
```

4. Deploy the Worker:

```bash
npm run presence:deploy
```

5. Note the deployed `workers.dev` URL printed by Wrangler.
6. In GitHub, open the repository settings, then Actions, then Variables.
7. Add this repository variable:

```text
VITE_PRESENCE_ENDPOINT=https://elvis-cafe-presence.<your-workers-subdomain>.workers.dev/presence
```

8. Rerun the `Deploy GitHub Pages` workflow.

### CORS

The Worker allows these origins by default:

- `https://gustavonline.github.io`
- `https://elvispresley.cafe`

To change this, edit `workers/presence/wrangler.jsonc`:

```json
"vars": {
  "ALLOWED_ORIGINS": "https://gustavonline.github.io,https://elvispresley.cafe"
}
```

The value is a comma-separated list of origins, not full paths. For the current GitHub Pages URL, the origin is `https://gustavonline.github.io`, even though the app path is `/elvispresley.cafe/`.

### Local Worker Development

Run the Worker locally:

```bash
npm run presence:dev
```

Then run the frontend with a local endpoint:

```bash
VITE_PRESENCE_ENDPOINT=http://127.0.0.1:8787/presence npm run dev
```

### Privacy

The Worker stores only:

- anonymous browser session id
- active station id
- expiry timestamp

Sessions expire after roughly 90 seconds without a heartbeat.

## Custom Domain DNS

For `elvispresley.cafe`, configure the custom domain in GitHub Pages first. Then update DNS at the domain provider using GitHub's current Pages instructions. After DNS validates, keep `VITE_BASE_PATH=/` so icons, images, and built assets resolve from the domain root.

## Local Preview

```bash
npm run build
npm run preview
```

Vite serves the already-built `dist/` directory. Use this for a final local smoke test before deploying.

## Hosting Requirements

- Serve `dist/` as static files.
- Preserve the app shell route.
- Serve files from `public/`, including the manifest, favicon PNG/SVG files, sitemap, robots file, and images.
- Do not require a Node server in production.
- If the site is hosted under a subpath, build with `VITE_BASE_PATH=/that-subpath/`.

## Other Free Options

- Cloudflare Pages: connect the GitHub repo, use `npm run build`, publish `dist`. This is a strong choice if DNS will also live in Cloudflare.
- Netlify: connect the GitHub repo, use `npm run build`, publish `dist`. This is simple for preview deploys and static hosting.
- GitHub Pages: simplest if the repo is public and you want one free production URL without another hosting account.

## Playback Notes

The YouTube IFrame API still requires a user gesture before playback. Some videos may be unavailable because of region, privacy, embedding policy, or network restrictions; the app handles clear unavailable events by auto-skipping through the station fallback path.
