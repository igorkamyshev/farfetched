import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import dts from '../../tools/vite/types';

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@farfetched/superstruct',
      fileName: 'superstruct',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['superstruct'],
    },
  },
});
