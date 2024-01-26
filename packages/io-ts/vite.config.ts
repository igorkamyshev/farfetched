import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsConfigFilePath: 'tsconfig.lib.json',
      skipDiagnostics: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@farfetched/io-ts',
      fileName: 'io-ts',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'io-ts',
        /* Because we import something from io-ts/SomePath */
        /^io-ts\/(.+)/,
      ],
    },
  },
});
