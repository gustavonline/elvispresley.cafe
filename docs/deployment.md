# Static Deployment Plan

The app is a Vite + React + TanStack Router static build. It does not require a server runtime.

## Recommendation

Use GitHub Pages with GitHub Actions for the first free deployment. Vite needs a build step, so the workflow in `.github/workflows/deploy-pages.yml` builds `dist/` and deploys that artifact to Pages.

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
6. If you connect the custom domain `elvispresley.cafe`, add a repository variable named `VITE_BASE_PATH` with the value `/`, then rerun the workflow.

Do not add a `CNAME` file until the domain is configured in GitHub Pages settings and DNS is pointing at GitHub Pages.

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
