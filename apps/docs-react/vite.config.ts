import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Alias the workspace adapter to its built entry (npm sometimes nests a registry
// copy in the app's node_modules, which would shadow the local build).
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@sentropic/dataviz-react': fileURLToPath(
        new URL('../../packages/dataviz-react/dist/index.js', import.meta.url),
      ),
    },
  },
});
