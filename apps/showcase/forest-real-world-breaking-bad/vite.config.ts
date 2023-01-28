import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir:
    '../../../node_modules/.vite/showcase-forest-real-world-breaking-bad',
  plugins: [tsconfigPaths()],
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
