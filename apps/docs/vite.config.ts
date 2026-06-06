import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// `base` is relative so the built demo works from any GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [svelte()],
});
