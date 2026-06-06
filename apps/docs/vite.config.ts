import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// `base` is relative so the built demo works from any GitHub Pages sub-path.
// The dataviz-svelte workspace package is aliased to its built entry so the demo
// always resolves the local build (npm sometimes nests a registry copy).
export default defineConfig({
  base: './',
  plugins: [svelte()],
  resolve: {
    alias: {
      '@sentropic/dataviz-svelte': fileURLToPath(
        new URL('../../packages/dataviz-svelte/dist/index.js', import.meta.url),
      ),
    },
  },
});
