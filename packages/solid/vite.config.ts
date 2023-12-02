import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/solid',

  plugins: [nxViteTsPaths(), solidPlugin()],

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
