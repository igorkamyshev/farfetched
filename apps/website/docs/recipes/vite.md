# Vite

:::info
Farfetched does not require any special configuration for Vite for basic usage. However, if you want to use advanced features like [`cache`](/api/operators/cache) or [server-side rendering](/recipes/ssr), you need to configure Vite. Detailed explanation of the reasons is available in [deep-dive article](/recipes/sids).
:::

[Vite](https://vitejs.dev/) uses ESBuild under the hood, which does not allow to use its internal AST in the plugins. To apply custom transformations to the code one must use either [Babel](https://github.com/owlsdepartment/vite-plugin-babel) or [SWC](https://github.com/egoist/unplugin-swc), which are allowing custom AST-transformations.

## Babel

1. Install required dependencies:

::: code-group

```sh [pnpm]
pnpm add --save-dev vite-plugin-babel
```

```sh [yarn]
yarn add --dev vite-plugin-babel
```

```sh [npm]
npm install --dev vite-plugin-babel
```

:::

2. Add [`vite-plugin-babel`](https://github.com/owlsdepartment/vite-plugin-babel) to your project:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    // Babel will try to pick up Babel config files (.babelrc or .babelrc.json)
    babel(),
    // ...
  ],
});
```

3. Set up `effector/babel-plugin` in your Babel config:

```json
// .babelrc
{
  "plugins": ["effector/babel-plugin"]
}
```

::: tip
If you are using [`@vitejs/plugin-react`](https://github.com/vitejs/vite/tree/main/packages/plugin-react#readme) in your project, you do not need to add `vite-plugin-babel` to your config, because it is already included in `@vitejs/plugin-react`. So, just modify your config to enable `effector/babel-plugin`.

```ts
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['effector/babel-plugin'],
      },
    }),
  ],
});
```

:::

## SWC

[SWC](https://swc.rs) is a blazing fast alternative to Babel.

::: warning
Note that [plugins for SWC are experimental](https://github.com/swc-project/swc/discussions/3540) and may not work as expected. We recommend to stick with Babel for now.
:::

1. Install required dependencies:

::: code-group

```sh [pnpm]
pnpm add --save-dev unplugin-swc effector-swc-plugin @swc/core
```

```sh [yarn]
yarn add --dev unplugin-swc effector-swc-plugin @swc/core
```

```sh [npm]
npm install --dev unplugin-swc effector-swc-plugin @swc/core
```

:::

2. Add [`unplugin-swc`](https://github.com/egoist/unplugin-swc) and [`effector-swc-plugin`](https://github.com/kireevmp/effector-swc-plugin) to your config:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        experimental: {
          plugins: ['effector-swc-plugin'],
        },
      },
    }),
  ],
});
```

::: tip
If you are using [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) in your project, you do not need to add `unplugin-swc` to your config, because it is already included in `@vitejs/plugin-react-swc`. So, just modify your config to enable `effector-swc-plugin`.

```ts
// vite.config.js
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    react({ plugins: [["effector-swc-plugin", {}]] });
  ],
});
```

:::

## Disable HMR

Effector does not support HMR [yet](https://github.com/effector/effector/issues/674). So, it's better to disable HMR for now to avoid unexpected behavior.

```ts
// vite.config.ts
export default defineConfig({
  server: {
    hmr: false,
  },
});
```
