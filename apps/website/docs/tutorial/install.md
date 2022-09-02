# Install Farfetched

:::tip You will learn:

- How to install minimal setup of Farfetched
- How to choose the best integration for your tech stack
- How to get the best DX by installing a few additional tools

:::

## Basic setup

First, you need to install Farfetched and its peer dependency:

with `pnpm`

```sh
pnpm install @farfecthed/core effector
```

with `yarn`

```sh
yarn add @farfecthed/core effector
```

with `npm`

```sh
npm install @farfecthed/core effector
```

:::info
Farfetched declares Effector as a peer dependency to prevent two instances of Effector in the same application. Read more about relation between Farfetched and Effector in [the statement](/statements/effector).
:::

Actually, that is all what you need to start, but consider installing one of the following integrations to improve your DX with popular tools:

- [`@farfetched/solid`](/integrations/solid/) with delicious helpers for Solid
- [`@farfetched/react`](/integrations/react/) with nice hooks for React

## Additional tools

For some advanced usage, like [writing tests](/recipes/testing) and [server-side rendering](/recipes/ssr), Farfetched requires a few code transformations. You can write it by hands, but it is a boring job that you can forward to a machine. Effector's ecosystem provides a few tools to help you with that.

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
[Vite](https://vitejs.dev) uses SWC under the hood, so you use Vite consider using SWC plugin instead of Babel plugin.
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
Read more about `@effector/babel-plugin` configuration in the [plugin documentation](https://github.com/effector/swc-plugin).
:::

### Deep dive

If you are interested in how code transformations works under the hood and why they are required for some usecases, you can dive into [advanced article about SIDs](/recipes/sids).
