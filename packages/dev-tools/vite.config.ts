import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true },
  plugins: [tsconfigPaths(), react()],
});
