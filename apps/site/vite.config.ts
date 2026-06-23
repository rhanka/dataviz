import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Vite + Svelte SPA, intentionally mirroring the existing `apps/docs` demo
// toolchain (vite 8 + plugin-svelte 7 + svelte 5) so no extra heavy deps
// (SvelteKit) are introduced and the workspace lockfile is untouched.
//
// `base` must be ABSOLUTE (not relative) for an SPA with deep links: with a
// relative base, loading `/charts/treemap` directly would request assets under
// `/charts/assets/…` and 404. The site is deployed under `/dataviz/site/` on
// GitHub Pages; override with DV_SITE_BASE for other hosts (use '/' for root).
// A 404.html fallback (copied at deploy time) makes every deep link resolve.
const BASE = process.env.DV_SITE_BASE ?? '/dataviz/site/';

export default defineConfig({
  base: BASE,
  plugins: [svelte()],
  resolve: {
    dedupe: ['svelte', 'react', 'react-dom', 'vue'],
    alias: {
      '@sentropic/dataviz-svelte': fileURLToPath(
        new URL('../../packages/dataviz-svelte/dist/index.js', import.meta.url),
      ),
      '@sentropic/dataviz-react': fileURLToPath(
        new URL('../../packages/dataviz-react/dist/index.js', import.meta.url),
      ),
      '@sentropic/dataviz-vue': fileURLToPath(
        new URL('../../packages/dataviz-vue/dist/index.js', import.meta.url),
      ),
    },
  },
  // React/Vue islands are imported dynamically at runtime; keep their core
  // libs out of the optimizer's eager scan so the Svelte SPA stays lean.
  // design-system-svelte is excluded so Vite compiles .svelte files on demand
  // (avoids stale pre-bundle cache overriding scoped style fixes).
  optimizeDeps: {
    exclude: ['@sentropic/design-system-svelte'],
    include: ['react', 'react-dom/client', 'vue'],
  },
});
