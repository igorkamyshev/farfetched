import tsconfigPaths from 'vite-tsconfig-paths';

import dts from '../../tools/vite/types';

export default {
  plugins: [tsconfigPaths(), dts()],
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        useAtomics: true,
      },
    },
  },
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
};
