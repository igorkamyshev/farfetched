import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import dts from '../../tools/vite/types';

export default defineConfig({
  plugins: [tsconfigPaths(), dts({ tsconfig: 'tsconfig.lib.json' })],
  test: { typecheck: { tsconfig: 'tsconfig.spec.json' } },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@farfetched/core',
      fileName: 'core',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector'],
    },
  },
});
