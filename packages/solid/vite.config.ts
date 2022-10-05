import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],
  test: {
    globals: true,
    setupFiles: './jest.setup.ts',
  },
  resolve: {
    conditions: ['browser'],
  },
});
