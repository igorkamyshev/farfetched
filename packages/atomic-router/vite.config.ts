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
      name: '@farfetched/atomic-router',
      fileName: 'atomic-router',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', '@farfetched/core'],
    },
  },
};
