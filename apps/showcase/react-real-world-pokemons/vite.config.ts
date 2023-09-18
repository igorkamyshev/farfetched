import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import reactPlugin from '@vitejs/plugin-react';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/showcase-react-real-world-pokemons',
  plugins: [nxViteTsPaths(), reactPlugin()],
  build: { outDir: '../../../dist/apps/showcase/react-real-world-pokemons' },
});
