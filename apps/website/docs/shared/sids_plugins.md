**Babel plugin**

If your project already uses [Babel](https://babeljs.io/), you do not have to install any additional packages, just modify your Babel config with the following plugin:

```json
{
  "plugins": ["effector/babel-plugin"]
}
```

:::info
Read more about `effector/babel-plugin` configuration in the [Effector's documentation](https://effector.now.sh/docs/api/effector/babel-plugin).
:::

**SWC plugin**

::: warning
Note that [plugins for SWC are experimental](https://github.com/swc-project/swc/discussions/3540) and may not work as expected. We recommend to stick with Babel for now.
:::

[SWC](https://swc.rs) is a blazing fast alternative to Babel. If you are using it, you can install `@effector/swc-plugin` to get the same DX as with Babel.

::: code-group

```sh [pnpm]
pnpm add --save-dev @effector/swc-plugin @swc/core
```

```sh [yarn]
yarn add --dev @effector/swc-plugin @swc/core
```

```sh [npm]
npm install --dev @effector/swc-plugin @swc/core
```

:::

Now just modify your `.swcrc` config to enable installed plugin:

```json
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "experimental": {
      "plugins": ["@effector/swc-plugin"]
    }
  }
}
```

:::info
Read more about `@effector/swc-plugin` configuration in the [plugin documentation](https://github.com/effector/swc-plugin).
:::

**Vite**

If you are using [Vite](https://vitejs.dev/), please read [the recipe about it](/recipes/vite).
