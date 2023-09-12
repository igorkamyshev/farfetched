[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/core/src/cache)

The `cache.ts` module in the `core/src/cache` directory of the farfetched project provides a caching mechanism for queries. It takes a `query` object and an optional `rawParams` object as parameters. The `cache` function sets up various effects and data sources to handle caching operations for the given query. 

For example, the `adapter`, `staleAfter`, and `purge` parameters are extracted from the `rawParams` object. If `adapter` is not provided, it defaults to an in-memory cache adapter. The `id` variable is assigned the unique identifier of the query using the `queryUniqId` function from the `key.ts` module.

```typescript
const cacheResult = cache(query, { adapter: 'memory', staleAfter: 60, purge: 'event' });
```

The `key.ts` module in the `core/src/cache/key` directory provides functions for generating unique keys for caching purposes. These keys are based on the properties of a `query` object. The `createKey` function takes in an object with `sid`, `params`, and `sources` properties and generates a unique hash value from these properties.

```typescript
const key = createKey({ sid: '123', params: ['param1', 'param2'], sources: ['source1', 'source2'] });
```

The `queryUniqId` function takes in a `query` object and attempts to extract a unique ID from it. If neither the `sid` nor the `name` properties exist in the `query` object's `__.meta` property, an error is thrown.

```typescript
const uniqId = queryUniqId({ __: { meta: { sid: '123', name: 'query1' } } });
```

These modules work together to provide efficient caching and retrieval of data in the farfetched project. By generating unique keys for each `query` object, the project can avoid unnecessary data duplication and improve performance.
