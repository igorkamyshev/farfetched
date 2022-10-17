import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import reactPlugin from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), reactPlugin()],
  build: { outDir: '../../../dist/apps/showcase/react-real-world-pokemons' },
});
