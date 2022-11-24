# Cache

Farfetched provides a way to [`cache`](/api/operators/cache) the result of the [_Query_](/api/primitives/query). Let's dive into internal details of this mechanism.

> In the following article, some [Effector](https://effector.dev) APIs are used to describe application logic — `createStore`, `createEffect` `combine`, `sample`.

## Valid data guarantee

[`cache`](/api/operators/cache) operator provides a guarantee that the cached data won't be saved to [_Query_](/api/primitives/query) unless it is valid for the current state of the [_Query_](/api/primitives/query). It means, you can safely deploy a new version of your application with a new expected shape of the data and the old cached data will be automatically invalidated.

### Data-flow

Internal implementation of this guarantee is a pretty simple. Farfetched is based on [Do not trust remote data](/statements/never_trust) principle, so it uses [_Contract_](/api/primitives/contract) and [_Validator_](/api/primitives/validator) to validate the data from the remote source.

::: tip
Read more detailed description of data-flow in [Data flow in Remote Operation](/recipes/data_flow) article.
:::

`cache` operator pushes the data to the [_Query_](/api/primitives/query) right after the **response parsing** stage of the data-flow. It means, same [_Contract_](/api/primitives/contract) and [_Validator_](/api/primitives/validator) are used to validate the cached data as any other data from the regular remote source. If the cached data is valid, it is saved to the [_Query_](/api/primitives/query). Otherwise, the cached data is ignored, and the [_Query_](/api/primitives/query) is updated with the new data from the remote source.

::: info
User-land code can't access the cached data directly. It is only available through the [_Query_](/api/primitives/query) object. So, invalid cached data is not exposed to the user.
:::

To achieve this, Every remote operation ([_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation)) exposes [_Event_](https://effector.dev/docs/api/effector/event) `.__.lowLevelAPI.fillData` that will push any data through the validation flow.

::: danger
`.__.lowLevelAPI.fillData` is a low-level API that is not recommended using it directly in user-land.
:::

## Cache key generation

[`cache`](/api/operators/cache) does not require any manual key generation to work, it uses the [SID](/recipes/sids) of the [_Query_](/api/primitives/query) and all external [_Stores_](https://effector.dev/docs/api/effector/store) that affect [_Query_](/api/primitives/query) to create a unique identifier for every cache entry. It means, key generation is fully automatic, and you don't need to worry about it.

### Sources extraction

Due to static nature of [Effector](/statements/effector) we can extract all external [_Stores_](https://effector.dev/docs/api/effector/store) that affect [_Query_](/api/primitives/query) right after application loading and use their values in key generation process.

Every factory has to pass a list of external [_Stores_](https://effector.dev/docs/api/effector/store) to field `.__.lowLevelAPI.sources`. It is a list of [_Stores_](https://effector.dev/docs/api/effector/store) that are used in the [_Query_](/api/primitives/query) creation process.

For example, the following [_Query_](/api/primitives/query) uses `$language` and `$region` [_Stores_](https://effector.dev/docs/api/effector/store) to define the final value of the field `url`:

```ts
const locationQuery = createJsonQuery({
  request: {
    url: {
      source: combine({ language: $language, region: $region }),
      fn: (_params, { language, region }) =>
        region === 'us'
          ? `https://us-west.salo.com/${language}/location`
          : `https://eu-cent.salo.com/${language}/location`,
    },
  },
});
```

Of course, we can just save both `$language` and `$region` to `.__.lowLevelAPI.sources` and use them in key generation process, but it is not the best solution. Final URL does not include the value of `$region` directly, it cares only if it is `"us"` or not, so we have to emphasize this fact in `.__.lowLevelAPI.sources`. To solve this issue, let's check internal implementation of [_Sourced_](/api/primitives/sourced) fields.

::: info
[_Sourced_](/api/primitives/sourced) fields are special fields in Farfetched that are allows to use any combination of [_Stores_](https://effector.dev/docs/api/effector/store) and functions to define the final value of the field.
:::

Under the hood Farfetched uses special helper `normalizeSourced` that transforms any [_Sourced_](/api/primitives/sourced) field to simple [_Stores_](https://effector.dev/docs/api/effector/store), in our case it would be something like this:

```ts
// internal function in Farfetched's sources
function normalizedSourced($store, start, transform) {
  const $result = createStore(null);
  sample({
    clock: start,
    source: $store,
    fn: (store, params) => transform(params, store),
    target: $result,
  });
  return $result;
}

// this transformation applied to the field `url` to get the final value
const $url = normalizedSourced(
  combine({ language: $language, region: $region }),
  query.start,
  (_params, { language, region }) =>
    region === 'us'
      ? `https://us-west.salo.com/${language}/location`
      : `https://eu-cent.salo.com/${language}/location`
);
```

After that, we can use `$url` in `.__.lowLevelAPI.sources`, it will contain only related data and could be used as a part of cache entry key. Same transformation applies for every sourced field to extract only significant data.

::: danger
`normalizeSourced` is a low-level API function that is used internally in Farfetched. It is not recommended using it directly in user-land.
:::

Static nature of [Effector](/statements/effector) allows us to perform this transformation under the hood and use only related data from to formulate cache entry key. It is an essential part of stable key generation that leads us to higher cache-hit rate.

### SID

Every [_Query_](/api/primitives/query) has a unique identifier — [SID](/recipes/sids). Effector provides a couple of plugins for automatic SIDs generation.

<!--@include: ../shared/sids_plugins.md-->

### Hashing algorithm

So, the key is a hash of the following data:

- `SID` of the [_Query_](/api/primitives/query)
- `params` of the particular call of the [_Query_](/api/primitives/query)
- current values of all external [_Stores_](https://effector.dev/docs/api/effector/store) that affect [_Query_](/api/primitives/query)

To get short and unique key, we stringify all data, concatenate it and then hash it with [SHA-1](https://en.wikipedia.org/wiki/SHA-1).

:::tip
SHA-1 is a [cryptographically broken](https://blog.mozilla.org/security/2017/02/23/the-end-of-sha-1-on-the-public-web/), but we use it for key generation only, so it is safe to use it in this case.
:::

## Adapter replacement

Sometimes it's necessary to replace current cache adapter with a different one. E.g. it's impossible to use `localStorage` on server-side during SSR, so you have to replace it with some in-memory adapter. To do this Farfetched provides a special property in every adapter `.__.$instance` that can be replaced via Fork API.

### Adapter internal structure

Fork API allows to replace any [_Store_](https://effector.dev/docs/api/effector/store) value in the particular [_Scope_](https://effector.dev/docs/api/effector/scope/), so we have to provide some "magic" to adapters to make it [_Store_](https://effector.dev/docs/api/effector/store)-like.

In general, every adapter is a simple object with the following structure:

```ts
const someAdapter = {
  get: createEffect(({ key }) => /* ... */),
  set: createEffect(({ key, value }) => /* ... */),
  purge: createEffect(() => /* ... */),
};
```

We have to add `.__.$instance` property to it to make it replacable via Fork API:

```ts
// internal function in Farfetched's sources
function makeAdapterRepalcable(adapter) {
  return {
    ...adapter,
    __: {
      $instance: createStore(adapter),
    },
  };
}
```

::: danger
`makeAdapterRepalcable` is a low-level API function that is used internally in Farfetched. It is not recommended using it directly in user-land.
:::

That's it, now we can replace any adapter with another one via Fork API:

```ts
// app.ts
import { localStorageCache } from '@farfetched/core';

// Create some adapter to use in the appliaction
const applicationCacheAdapter = localStorageCache();

cache(query, { adapter: applicationCacheAdapter });

// app.test.ts
import { inMemoryCache } from '@farfetched/core';

test('app', async () => {
  const scope = fork({
    values: [
      // Replace its implementation during fork
      [applicationCacheAdapter.__.$instance, inMemoryCache()],
    ],
  });
});
```

Operator [`cache`](/api/operators/cache) does not use `.get`, `.set` and `.purge` methods directly, it extracts them from the `.__.$instance` on every hit instead. It allows users to replace adapters in specific environments (such as tests or SSR) without any changes in the application code.

## [_Query_](/api/primitives/query) interruption

[`cache`](/api/operators/cache) allows skipping [_Query_](/api/primitives/query) execution if the result is already in the cache and does not exceed the `staleAfter` time. It uses internal Interruption API to do this.

### Interruption API

::: danger
Interruption API is an internal API that is not recommended using directly in user-land.
:::

Every remote operation ([_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation)) has internal flag — `withInterruption`. If it is `true` — [_Event_](https://effector.dev/docs/api/effector/event) `.start` will not start execution of the operation immediately, instead it will wait for the second [_Event_](https://effector.dev/docs/api/effector/event) — `.__.lowLevelAPI.resumeExecution` that could be called with a delay or with different parameters, or even could never be called at all to skip the operation execution.

By default, `withInterruption` is `false`, but it could be switched to false via `.__.lowLevelAPI.registerInterruption` function.

::: info
`.__.lowLevelAPI.registerInterruption` is not an [_Event_](https://effector.dev/docs/api/effector/event), so it must not be called during application runtime, it has to be called only during application startup.
:::
