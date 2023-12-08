import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import solid from 'vite-plugin-solid';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/showcase-solid-real-world-rick-morty',
  plugins: [
    nxViteTsPaths(),
    solid({
      /*
       * solid plugin supports only .tsx and .jsx files by default
       */
      extensions: ['.ts'],
      /*
       * @farfetched/dev-tools is better when effector/babel-plugin is used
       */
      babel: {
        plugins: [
          [
            'effector/babel-plugin',
            {
              /* register all factories to improve DX */
              factories: [
                'src/entities/location',
                'src/entities/character',
                'src/entities/episode',
              ],
            },
          ],
        ],
      },
    }),
    /*
     * @farfetched/dev-tools in dev mode does not built,
     * so we use them as sources and have to build it.
     */
    vue(),
  ],
  resolve: {
    conditions: ['browser'],
  },
  build: { outDir: '../../../dist/apps/showcase/solid-real-world-rick-morty' },
});
