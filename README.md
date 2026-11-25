# Project Fibre

A contemporary fibre arts atelier journal, pattern notebook, and static Markdown blog designed for publishing directly on **GitHub Pages**.

## Design System
Built with the **Kawaii Loom & Spun** visual tokens:
- **Canvas**: Cozy Carded Cream (`#fdf9f3` / `#faf6f0`) with subtle knitted dot mesh (`16px × 16px`)
- **Typography**: `Epilogue` display headings, `Plus Jakarta Sans` editorial body, `Space Grotesk` gauge & loom specs
- **Palette**: Spun Blossom Rose (`#7c5264` / `#e8b4c8`), Deep Mulberry Plum (`#2d1f3d`), Soft Heather Lilac (`#d8b4e2`), Warm Butter (`#fef3c7`), and Minty Sage (`#d1fae5`)

## Publishing to GitHub Pages

1. Push this repository to GitHub on the `main` branch.
2. Open **Settings → Pages** in your GitHub repository and set **Source** to **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` workflow builds `dist/` via Vite and publishes automatically on every push.

## Writing New Posts
- Use the in-app **Write Post** studio to compose essays in Markdown, preview them live, or import/export YAML-frontmatter `.md` files.
- To commit posts permanently to your repository, add your post object to `src/data/posts.ts` and push to `main`.
