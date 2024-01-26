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
      name: '@farfetched/atomic-router',
      fileName: 'atomic-router',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', '@farfetched/core'],
    },
  },
});
