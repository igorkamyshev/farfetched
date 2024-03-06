<script setup>
import coreRaw from '../../../../../packages/core/dist/core.js?raw';
import runtypesRaw from '../../../../../packages/runtypes/dist/runtypes.js?raw';
import { Sandpack } from 'sandpack-vue3';

const props = defineProps(['demoFile']);

const files = {
  '/src/App.vue': props.demoFile,
  ...localPackage({ name: 'core', content: coreRaw }),
  ...localPackage({ name: 'runtypes', content: runtypesRaw }),
};

const customSetup = {
  dependencies: {
    effector: 'latest',
    'effector-vue': 'latest',
    runtypes: '^6.5.1',
  },
};

function localPackage({ name, content }) {
  return {
    [`/node_modules/@farfetched/${name}/package.json`]: {
      hidden: true,
      code: JSON.stringify({
        name: `@farfetched/${name}`,
        main: './index.js',
      }),
    },
    [`/node_modules/@farfetched/${name}/index.js`]: {
      hidden: true,
      code: content,
    },
  };
}
</script>

<template>
  <Sandpack
    template="vue3"
    theme="auto"
    :files="files"
    :customSetup="customSetup"
  />
</template>
