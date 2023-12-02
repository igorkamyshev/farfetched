import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/showcase-solid-real-world-rick-morty',
  plugins: [nxViteTsPaths(), solidPlugin()],
  resolve: {
    conditions: ['browser'],
  },
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
