import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],
  resolve: {
    conditions: ['browser'],
  },
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
