### Babel plugin

If your project already uses [Babel](https://babeljs.io/), you do not have to install any additional packages, just modify your Babel config with the following plugin:

```json
{
  "plugins": [["effector/babel-plugin", { "factories": "@farfetched/core" }]]
}
```

:::info
Read more about `effector/babel-plugin` configuration in the [Effector's documentation](https://effector.now.sh/docs/api/effector/babel-plugin).
:::

### SWC plugin

[SWC](https://swc.rs) is a blazing fast alternative to Babel. If you are using it, you can install `@effector/swc-plugin` to get the same DX as with Babel.

:::tip
[Vite](https://vitejs.dev) uses SWC under the hood, if you use Vite consider using SWC plugin instead of Babel plugin.
:::

with `pnpm`

```sh
pnpm install @effector/swc-plugin @swc/core
```

with `yarn`

```sh
yarn add @effector/swc-plugin @swc/core
```

with `npm`

```sh
npm install @effector/swc-plugin @swc/core
```

Now just modify your `.swcrc` config to enable installed plugin:

```json
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "experimental": {
      "plugins": [
        "@effector/swc-plugin",
        {
          "factories": ["@farfetched/core"]
        }
      ]
    }
  }
}
```

:::info
Read more about `@effector/swc-plugin` configuration in the [plugin documentation](https://github.com/effector/swc-plugin).
:::
