import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Alias the workspace adapter to its built entry (npm sometimes nests a registry
// copy in the app's node_modules, which would shadow the local build).
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@sentropic/dataviz-vue': fileURLToPath(
        new URL('../../packages/dataviz-vue/dist/index.js', import.meta.url),
      ),
    },
  },
});
