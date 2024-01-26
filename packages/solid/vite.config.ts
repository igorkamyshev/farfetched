import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    solidPlugin(),
    dts({
      entryRoot: 'src',
      tsConfigFilePath: 'tsconfig.lib.json',
      skipDiagnostics: true,
      rollupTypes: true,
    }),
  ],
  test: {
    globals: true,
    setupFiles: './test.setup.ts',
  },
  resolve: {
    conditions: ['browser'],
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@farfetched/solid',
      fileName: 'solid',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['solid-js', 'effector-solid', '@farfetched/core'],
    },
  },
});
