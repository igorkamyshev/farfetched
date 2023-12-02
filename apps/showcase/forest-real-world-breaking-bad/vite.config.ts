import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir:
    '../../../node_modules/.vite/showcase-forest-real-world-breaking-bad',
  plugins: [nxViteTsPaths()],
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
