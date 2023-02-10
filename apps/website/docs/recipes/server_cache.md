---
outline: [2, 3]
---

# Server side caching

Let's talk about [caching](/tutorial/caching) and [SSR](/recipes/ssr) in the single recipe. If you render your application on the server, TTFB (time to first byte) is very important and caching of data-source responses can help you to reduce it.

<!--@include: ../shared/case.md-->

## Pre-requisites

Do not forget that [`cache`](/api/operators/cache) operator requires setting up [SIDs](/recipes/sids) in your application. It can be done by using code transformation tools.

<!--@include: ../shared/sids_plugins.md-->

## Kick-off

Let's say we have a simple application with a list of characters and a page with a character details. We want to cache the list of characters on the server side, so we can render it on the server and don't need to wait for the response from the data-source.

```ts
import { createJsonQuery } from '@farfetched/core';

export const characterListQuery = createJsonQuery({
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: 'https://rickandmortyapi.com/api/character',
    method: 'GET',
  },
  response: { contract: charactersListContract },
});
```

So, we can simply use [`cache`](/api/operators/cache) operator to cache the response from the data-source.

```ts
import { cache } from '@farfetched/core';

cache(characterListQuery);
```

And it'll work. But there is a problem. By default, [`cache`](/api/operators/cache) operator stores the response in the memory. So:

- if you restart the server, the cache will be cleared
- if you have multiple instances of the server, the cache won't be shared between them

In order to solve this problem, we can use custom adapter to store the cache in the any external storage. Let's use **Redis** as an example.

## Implementation

### Custom adapter

First, we need to install some package to deal with Redis, let's use `ioredis`:

::: code-group

```sh [pnpm]
pnpm install ioredis
```

```sh [yarn]
yarn add ioredis
```

```sh [npm]
npm install ioredis
```

:::

Then we need to create a [custom adapter for `cache`](/api/operators/cache.html#adapters) operator to store the cache in Redis. In Farfetched custom adapters are just functions that accept some options and return a special object with some methods — `get`, `set`, `unset` and `purge`. Let's implement the adapter with a Redis as a storage.

::: tip
`createAdapter` is a helper function that helps to create custom adapters. It accepts an object with `get`, `set`, `unset` and `purge` methods and returns an adapter object with the same methods and some additional properties. It has to be used in order to make the adapter compatible with the `cache` operator.
:::

```ts
import { createEffect } from 'effector';
import { type Time, createAdapter } from '@farfetched/core';

function redisCache({ maxAge }: { maxAge: Time }) {
  return createAdapter({
    get: createEffect(
      (_: { key: string }): { value: unknown; cachedAt: number } | null => {
        // TODO: implement
        return null;
      }
    ),
    set: createEffect((_: { key: string; value: unknown }) => {
      // TODO: implement
      return;
    }),
    unset: createEffect((_: { key: string }) => {
      // TODO: implement
      return;
    }),
    purge: createEffect(() => {
      // TODO: implement
      return;
    }),
  });
}
```

::: tip Effects
Because Farfetched uses [Effector](/statements/effector) under the hood, it is required to use make all the side effects in custom adapters performed by [_Effects_](https://effector.dev/docs/api/effector/effect) that are created by [`createEffect`](https://effector.dev/docs/api/effector/createEffect) function.
:::

Now, let's implement all methods of the adapter one by one.

#### `get`

`get` [_Effect_](https://effector.dev/docs/api/effector/effect) accepts a single argument — an object with `key` property. It should return an object with `value` and `cachedAt` properties or `null` if there is no value in the cache.

```ts{4,7-14}
import Redis from 'ioreis';

function redisCache({ maxAge }: { maxAge: Time }) {
  const redis = new Redis();

  return createAdapter({
    get: createEffect(async ({ key }: { key: string }) => {
      // NOTE: we store stringified object with {value, cachedAt} in the Redis
      const valueFromCache = await redis.get(key);
      if (!valueFromCache) {
        return null;
      }
      return JSON.parse(valueFromCache);
    }),
    set,
    unset,
    purge,
  });
}
```

#### `set`

`set` [_Effect_](https://effector.dev/docs/api/effector/effect) accepts a single argument — an object with `key` and `value` properties. It should store the value in the cache.

Because of internal implementation of the `cache` operator, it is required to store the `cachedAt` property in the cache. It is a timestamp of the moment when the value was cached. So, let's store it together with the value in the cache.

```ts{5,9-19}
import Redis from 'ioreis';
import { parseTime } from '@farfetched/core';

function redisCache({ maxAge }: { maxAge: Time }) {
  const redis = new Redis();

  return createAdapter({
    get,
    set: createEffect(
      async ({ key, value }: { key: string; value: unknown }) => {
        await redis.set(
          key,
          JSON.stringify({ value, cachedAt: Date.now() }),
          'EX',
          // NOTE: use parseTime to convert Time to milliseconds
          parseTime(maxAge)
        );
      }
    ),
    unset,
    purge,
  });
}
```

#### `unset`

`get` [_Effect_](https://effector.dev/docs/api/effector/effect) accepts a single argument — an object with `key` property. It should remove the value from the cache.

```ts{4,9-11}
import Redis from 'ioredis';

function redisCache({ maxAge }: { maxAge: Time }) {
  const redis = new Redis();

  return createAdapter({
    get,
    set,
    unset: createEffect(async ({ key }: { key: string }) => {
      await redis.del(key);
    }),
    purge,
  });
}
```

#### `purge`

`get` [_Effect_](https://effector.dev/docs/api/effector/effect) doesn't accept any arguments. It should remove all the values from the cache.

```ts{4,10-12}
import Redis from 'ioredis';

function redisCache({ maxAge }: { maxAge: Time }) {
  const redis = new Redis();

  return createAdapter({
    get,
    set,
    unset,
    purge: createEffect(async () => {
      await redis.flushall()
    }),
  });
}
```

### Different adapters in different environments

So far, we have implemented a custom adapter for the `cache` operator. But we still need to use it in our application. And we need to use different adapters in different environments — on server and on client.

Effector has a built-in mechanism to inject different implementations of the same value in different environments — [Fork API](https://effector.dev/docs/api/effector/fork). Let's use it to inject different adapters in different environments.

Write default path in the regular way:

```ts
import { inMemoryCache } from '@farfetched/core';

// NOTE: we use inMemoryCache as a default adapter
const charactersCache = imMemoryCache();

cache(characterListQuery, { adapter: charactersCache });
```

And then, in the `server.ts` file, we can inject the Redis adapter during `fork`:

```ts
// server.ts
function handleHttp(req, res) {
  const scope = fork({
    values: [[charactersCache.__.$adapter, redisCache({ maxAge: '1h' })]],
  });

  // ... run calculations

  // ... render html

  // ... send response
}
```

## Future improvements

## Conclusion
