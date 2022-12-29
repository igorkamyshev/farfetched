import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
