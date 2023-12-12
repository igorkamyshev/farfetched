import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/solid',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsConfigFilePath: path.join(__dirname, 'tsconfig.lib.json'),
      skipDiagnostics: true,
    }),
    solidPlugin(),
  ],

  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'solid',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', '@farfetched/core', 'solid-js'],
    },
  },

  test: {
    globals: true,
    setupFiles: './test.setup.ts',
    cache: { dir: '../../node_modules/.vitest' },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  resolve: {
    conditions: ['browser'],
  },
});
