# Install Farfetched

:::tip You will learn:

- How to install minimal setup of Farfetched
- How to choose the best integration for your tech stack
- How to get the best DX by installing a few additional tools

:::

## Basic setup

First, you need to install Farfetched and its peer dependency:

::: code-group

```sh [pnpm]
pnpm install @farfetched/core effector
```

```sh [yarn]
yarn add @farfetched/core effector
```

```sh [npm]
npm install @farfetched/core effector
```

:::

:::info
Farfetched declares Effector as a peer dependency to prevent two instances of Effector in the same application. Read more about relation between Farfetched and Effector in [the statement](/statements/effector).
:::

Actually, that is all what you need to start, but consider installing one of the following integrations to improve your DX with popular tools:

- [`effector-solid`](https://effector.dev/en/api/effector-solid/) and [`@farfetched/solid`](/api/ui/solid) with delicious helpers for Solid
- [`effector-react`](https://effector.dev/en/api/effector-react/) with nice hooks for React

## Additional tools

For some advanced usage, like [`cache`](/api/operators/cache) or [server-side rendering](/recipes/ssr), Farfetched requires a few code transformations. You can write it by hands, but it is a boring job that you can forward to a machine. Effector's ecosystem provides a few tools to help you with that.

<!--@include: ../shared/sids_plugins.md-->

### Deep dive

If you are interested in how code transformations works under the hood and why they are required for some use cases, you can dive into [advanced article about SIDs](https://effector.dev/en/explanation/sids/).
