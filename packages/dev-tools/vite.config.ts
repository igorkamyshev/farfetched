/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import vue from '@vitejs/plugin-vue';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsConfigFilePath: 'tsconfig.lib.json',
      skipDiagnostics: true,
      rollupTypes: true,
    }),
    vue(),
    libInjectCss(),
  ],

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
