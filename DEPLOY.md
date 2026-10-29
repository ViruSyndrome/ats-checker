# Deploy notes (GetATSReady)

## Clean Pages deploy (recommended)

Workflow: `.github/workflows/deploy-pages.yml`

It publishes only public HTML/CSS/JS/assets (excludes `*.py`, `docs/`, `scripts/`, `assets/alternativeto/`, etc.).

**You must flip this once:** GitHub repo → Settings → Pages → Source → **GitHub Actions**.

Until then, “Deploy from a branch” still serves the whole `main` tree (including tooling).

## Why this helps

- Stops strangers downloading your generators, patch scripts, and internal docs
- Slightly cleaner crawl surface for Google
- Same live site for users; tooling stays in git for you

## Keep

- `CNAME` — `www.getatsready.com`
- Public HTML/CSS/JS, favicon, og-image
