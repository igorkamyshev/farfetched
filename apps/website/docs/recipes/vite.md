# Vite

[Vite](https://vitejs.dev/) uses ESBuild under the hood, which does not allow to use its internal AST in the plugins. To apply custom transformations to the code one must use either [Babel](https://github.com/owlsdepartment/vite-plugin-babel) or [SWC](https://github.com/egoist/unplugin-swc), which are allowing custom AST-transformations.

## Babel

1. Add [`vite-plugin-babel`](https://github.com/owlsdepartment/vite-plugin-babel) to your project:

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

2. Set up `effector/babel-plugin` in your Babel config:

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

[SWC](https://swc.rs) is a blazing fast alternative to Babel. If you want to use it, you need to install [`unplugin-swc`](https://github.com/egoist/unplugin-swc) and [`@effector/swc-plugin`](https://github.com/effector/swc-plugin) and set up the plugin in your config:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        experimental: {
          plugins: ['@effector/swc-plugin'],
        },
      },
    }),
  ],
});
```
