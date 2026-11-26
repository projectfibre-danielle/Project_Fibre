# Project Fibre

A fibre arts blog dedicated to all things fibre and equipping fibre artists with good resources and apps to make all things fibre easier and more enjoyable.

## Publishing New Posts (Owner-Only via GitHub)
Only the repository owner can publish posts by editing `src/data/posts.ts` and pushing to `main`.

## Deployment
1. Push changes to the `main` branch on GitHub.
2. Under **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow at `.github/workflows/deploy.yml` builds `dist/` and deploys automatically to GitHub Pages.
