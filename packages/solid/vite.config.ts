import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [tsconfigPaths({ root: '../../' }), solidPlugin()],
  test: {
    globals: true,
    setupFiles: './test.setup.ts',
    typecheck: { ignoreSourceErrors: true },
  },
  resolve: {
    conditions: ['browser'],
  },
});
