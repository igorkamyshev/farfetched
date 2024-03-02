import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import vue from '@vitejs/plugin-vue';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

import dts from '../../tools/vite/types';

export default defineConfig({
  plugins: [tsconfigPaths(), dts(), vue(), libInjectCss()],

  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@farfetched/dev-tools',
      fileName: 'dev-tools',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', 'effector/inspect', '@farfetched/core'],
    },
  },

  test: {
    passWithNoTests: true,
  },
});
