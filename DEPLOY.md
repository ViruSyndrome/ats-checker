# Deploy notes (GetATSReady)

## GitHub Pages publishes the whole repo

If Pages is set to “Deploy from a branch” at `/` (root), **already-tracked** files are still served even when listed in `.gitignore`. Ignoring only stops *new* untracked copies from being added.

To stop serving tooling (`*.py`, `docs/`, `scripts/`, `assets/alternativeto/`, etc.):

1. Configure Pages from a `/docs` publish folder that contains only the public site, **or**
2. Use a GitHub Action that copies only HTML/CSS/JS and public image assets into the Pages artifact.

Do not rely on `.gitignore` alone to hide files that are already in git history.

## Keep

- `CNAME` — custom domain for GitHub Pages (`www.getatsready.com`)
- Public HTML/CSS/JS, `favicon`, `og-image`, role pages that should stay live
