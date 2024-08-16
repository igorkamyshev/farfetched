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

If you are using [SWC](https://swc.rs), please read the official documentation of [`@effector/swc-plugin`](https://effector.dev/en/api/effector/swc-plugin/).

**Vite**

If you are using [Vite](https://vitejs.dev/), please read [the recipe about it](/recipes/vite).
