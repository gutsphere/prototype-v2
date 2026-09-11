# Gutsphere Demo

Static click-through prototype of the Gutsphere product UI. Hash-routed, no Rails, no live AI. One constipation persona (Bimal).

This repo is the GitHub Pages copy. Product work still happens in `gutsphere_app` at `docs/prototypes/demo-v2`.

## GitHub Pages

The site is already static. Hash routes (`#/today`) need no server rewrite.

1. Create a public GitHub repo (for example `gutsphere/gutsphere-demo`).
2. Push this folder as `main`.
3. In the repo: **Settings → Pages**.
   - Source: **GitHub Actions** (uses `.github/workflows/pages.yml`), or
   - Source: **Deploy from a branch** → `main` → `/ (root)`.
4. After the first deploy, the site is at:

`https://<org>.github.io/<repo>/`

Example: `https://gutsphere.github.io/gutsphere-demo/#/today`

Optional custom domain: add a `CNAME` file with `demo.gutsphere.com` and point DNS at GitHub Pages.

The repo must be **public** unless the org has GitHub Pages on private repos.

## Run locally

```bash
npm start
```

Open http://127.0.0.1:4173

Python alternative:

```bash
python3 -m http.server 4173
```

## Sync from the Rails repo

From this folder, after you change the prototype in `gutsphere_app`:

```bash
./sync-from-app.sh
```

Default source: `../gutsphere_app/docs/prototypes/demo-v2`

## Hash routes

Primary: `#/plan-generation` `#/plan` `#/today` `#/track` `#/journey` `#/care` `#/chat`

Secondary: `#/profile` `#/notifications` `#/entry` `#/visit` `#/insight`

Entry flow: Plan generation → Plan → Today. Plan is not a bottom-nav tab.
