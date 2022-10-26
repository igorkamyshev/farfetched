# Cache

Farfetched provides a way to [`cache`](/api/operators/cache) the result of the [_Query_](/api/primitives/query). Let's dive into internal details of this mechanism.

## Valid data guarantee

[`cache`](/api/operators/cache) operator provides a guarantee that the cached data won't be saved to [_Query_](/api/primitives/query) unless it is valid for the current state of the [_Query_](/api/primitives/query). It means, you can safely deploy a new version of your application with a new expected shape of the data and the old cached data will be automatically invalidated.

### Data-flow

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

```

```
