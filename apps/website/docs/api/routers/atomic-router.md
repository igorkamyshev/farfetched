---
outline: [2, 3]
---

# Farfetched and Atomic Router

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage:

::: code-group

```sh [pnpm]
pnpm install atomic-router @farfetched/atomic-router
```

```sh [yarn]
yarn add atomic-router @farfetched/atomic-router
```

```sh [npm]
npm install atomic-router @farfetched/atomic-router
```

:::

## API

::: warning
Atomic Router is still in development, so the API is not stable yet. This integration is tested with `atomic-router@0.9.1`, but it should work with any version of `atomic-router`.
:::

Integration provides the way to use any [_Query_](/api/primitives/query) in [`chainRoute` operator](https://atomic-router.github.io/api/chain-route.html). It has two options to transform [_Query_](/api/primitives/query) to the shape that `chainRoute` expects:

### `freshChain`

After opening a route with `freshChain`, `.refresh` [_Event_](https://effector.dev/en/api/effector/event/) would be executed. So, [_Query_](/api/primitives/query) will be **executed only if it is already `.$stale`**.

```ts
import { createJsonQuery } from '@farfetched/core';
import { freshChain } from '@farfetched/atomic-router';
import { chainRoute, createRoute } from 'atomic-router';

const postRoute = createRoute<{ postId: string }>();

const postQuery = createJsonQuery({
  /* ... */
});

const postLoadedRoute = chainRoute({
  route: postRoute,
  ...freshChain(postQuery),
});
```

### `startChain`

After opening a route with `startChain`, `.start` [_Event_](https://effector.dev/en/api/effector/event/) would be executed. So, [_Query_](/api/primitives/query) will be **executed unconditionally**.

```ts
import { createJsonQuery } from '@farfetched/core';
import { startChain } from '@farfetched/atomic-router';
import { chainRoute, createRoute } from 'atomic-router';

const postRoute = createRoute<{ postId: string }>();

const postQuery = createJsonQuery({
  /* ... */
});

const postLoadedRoute = chainRoute({
  route: postRoute,
  ...startChain(postQuery),
});
```

### `barrierChain` <Badge type="tip" text="since v0.12.0" />

After opening a route with `barrierChain`, [_Barrier_](/api/primitives/barrier) `.$active` status will be checked. Route will be opened only after [_Barrier_](/api/primitives/barrier) deactivation. If [_Barrier_](/api/primitives/barrier) is not active, route will be opened immediately.

```ts
import { createBarrier } from '@farfetched/core';
import { barrierChain } from '@farfetched/atomic-router';
import { chainRoute, createRoute } from 'atmoic-router';

const anyRoute = createRoute();

const authBarrier = createBarrier({
  /* ... */
});

const authOnlyRoute = chainRoute({
  route: anyRoute,
  ...barrierChain(authBarrier),
});
```
