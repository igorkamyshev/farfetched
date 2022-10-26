# `cache`

Saves result of the [_Query_](/api/primitives/query) to some storage and allows to restore it back.

## Formulae

```ts
import { cache } from '@farfetched/core';

cache(query, config);
```

Config fields:

- `adapter`: _CacheAdapter_

## Adapters

Required field `adapter` is used to specify storage to save results. Available adapters:

- `inMemoryCache` useful for caching results of the [_Query_](/api/primitives/query) during one interaction with the application.
- `sessionStorageCache` uses [Session Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), useful for caching results of the [_Query_](/api/primitives/query) across tab reloads during single session.
- `localStorageCache` uses [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), useful for caching results of the [_Query_](/api/primitives/query) across sessions.
- `voidCache` never saves anything, never restores anything. It's useful for testing purposes.

### Auto-deletion

Every adapter accepts settings for auto-deletion of the cached results by the following fields:

- `maxAge?` - _number_ with a maximum age of the cached result in milliseconds or _string_ with a maximum age of the cached result in human-readable format, like `1h23m14s`
- `maxEntries?` — _number_ with a maximum number of maximum entries in the cache

```ts
import { cache } from '@farfetched/core';
import { createEvent } from 'effector';

cache(query, {
  adapter: someAdapter({ maxAge: '15m', maxEntries: 300 }),
});
```

### Observability

Every adapter accepts settings for observability of the cached results by the field `observability`:

```ts
import { cache } from '@farfetched/core';
import { createEvent } from 'effector';

const hit = createEvent(); // result is **found** and restored
const miss = createEvent(); // result is **not found**
const expired = createEvent(); // cache entry is **expired** and deleted
const evicted = createEvent(); // cache entry is **evicted** and deleted

cache(query, {
  adapter: someAdapter({ observability: { hit, miss, expired, evicted } }),
});
```

### External adapter for `cache`

To integrate `cache` with external cache storage (e.g. Redis), there is `externalCache` provider.

```ts
import { cache, externalCache } from '@farfetched/core';

cache(query, {
  adapter: externalCache({
    get: async ({ key }) => {
      const result = await redis.get(key);

      return JSON.parse(result);
    },
    set: async ({ key, value }) => {
      await redis.set(key, JSON.stringify(value));
    },
    purge: async () => {
      await redis.flushdb();
    },
  }),
});
```

::: warning
Due to external nature of the storage, `externalCache` supports only subset of observability events: `observability.hit` and `observability.miss`, any other event is not supported.
:::
