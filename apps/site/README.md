# @sentropic/dataviz-site

Docs + gallery website for **@sentropic/dataviz**, in the spirit of
`highcharts.com/docs`. It is mapped to the **Sent Tech design-system website**:
same stack family (Vite + Svelte 5 + design-system tokens/themes), same chrome
(sticky header + left sidebar + content), same theming/dark-mode mechanism, so
the two sites feel like one product.

Live target: `dataviz.sent-tech.ca` · deployed on GitHub Pages under
`/dataviz/site/`.

## What it is

- A **landing page** + left-nav with sections **Charts / Dashboards / Grids**
  (+ a **Guides / Getting-started** page).
- A page for **every dataviz component** (~58) with:
  - a **live, interactive demo** bound to a realistic seeded dataset
    (~700 deterministic rows — sales by region/country/city/category/product/
    channel over a 12-month window, with revenue/units/margin/price + lat,lng);
  - **interactive controls** (measure/dimension switchers, filters) plus a
    global **palette switcher** (5 non-monochrome palettes), a **light/dark/auto
    toggle**, and a **framework switcher** (Svelte/React/Vue) in the header;
  - a short **use-case writeup**;
  - **copy-paste code tabs** for Svelte / React / Vue.

## Golden rule

Presentation comes 100 % from the design system. Nothing is hand-painted: the
chrome reads design-system **tokens** (`--st-semantic-*`, spacing, radius,
motion), charts read the design-system **data palette** tokens
(`--st-semantic-data-categoryN`), and dark mode is a token overlay under
`[data-color-mode="dark"]` — the same approach as the DS docs site's
`compileThemeModes`. The site only contributes **layout**; dataviz contributes
**state & orchestration** (cross-filter, drill, Top-N, KPIs…) via
`@sentropic/dataviz-core`.

## Stack (mirrored from the DS docs site, minus SvelteKit)

| Concern        | Choice |
|----------------|--------|
| Build          | **Vite 8** (same as `apps/docs`) |
| UI             | **Svelte 5** (runes) |
| Routing        | tiny History-API SPA router (`src/lib/site/router.svelte.ts`) |
| Theme/tokens   | `@sentropic/design-system-themes` (`compileTheme`) injected on `:root` |
| Components CSS  | `@sentropic/design-system-react/styles.css` (global `.st-*`) |
| Islands         | React 19 / Vue 3.5 available for runtime islands (TODO, see below) |

> **Why not SvelteKit?** The DS docs site uses SvelteKit + adapter-static, but
> SvelteKit is not installed in this workspace and pulls a different Vite major.
> To avoid churning the lockfile and breaking the existing demos, this site
> reuses the already-installed `apps/docs` toolchain (Vite + plugin-svelte +
> Svelte 5) and ships a static SPA. All the *user-visible* DS mirroring (theme,
> dark-mode, chrome, island-capable React/Vue) is preserved.

## Develop & build

```bash
# from repo root (installs the workspace once)
npm ci

# dev server (root base, http://localhost:5173)
DV_SITE_BASE=/ npm run dev   --workspace apps/site

# production build (defaults base to /dataviz/site/ for GitHub Pages)
npm run build --workspace apps/site

# local preview of the production build at the deploy base
npm run preview --workspace apps/site
```

`base` is **absolute** and configurable via `DV_SITE_BASE`:

- GitHub Pages deploy → `/dataviz/site/` (the default).
- Any root host → set `DV_SITE_BASE=/`.

An absolute base is required for an SPA with deep links: with a relative base,
loading `/charts/treemap` directly would request assets under `/charts/assets/…`
and 404. A `404.html` (copy of `index.html`) is emitted at deploy time so deep
links resolve on the static host.

## Deployment

`.github/workflows/pages.yml` builds the three demos **and** this site, then
publishes it under `/site` (with the `404.html` fallback) alongside the existing
demos. The root `npm run build` already includes `apps/site` because it is a
workspace with a `build` script.

## Status (iteration 1)

**Done**

- Full chrome mirrored from the DS site (header, sidebar, breadcrumb, mobile).
- 5 multi-colour palettes + light/dark/auto + framework switcher, all persisted.
- Realistic deterministic dataset (~700 rows) + per-page isolated stores.
- Live interactive demos for **all charts, dashboards/BI and grids** components
  (verified: 58 routes render, 0 console errors, no empty data).
- Use-case writeups + tri-framework copy-paste code on every page.
- Getting-started guide (install / model / store / theming / golden rule).
- Pages workflow extended; production build passes.

**TODO / next iterations**

- **Live React/Vue islands**: today the live preview always renders the real
  Svelte component (genuinely a dataviz component) and the code tabs show all
  three frameworks. Wiring runtime React/Vue islands (like the DS site does for
  Modal/Drawer) so the *live* preview also switches framework is the main
  follow-up. The React/Vue dataviz packages expose the identical API, so this is
  mechanical.
- `GeoJsonMap` page (needs a real GeoJSON geometry field in the dataset).
- Per-component "options" panels for the few charts that currently expose only
  measure/dimension switches.
- i18n (FR/EN) — copy is FR-only for now, matching the DS site's default.
- Wire a cross-link from the existing `apps/pages-landing.html` to `/site`
  (left to the orchestrator; that file is out of this task's edit scope).
