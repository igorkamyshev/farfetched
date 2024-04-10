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
      name: '@farfetched/json-schema',
      fileName: 'json-schema',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', '@farfetched/core'],
    },
  },
};
