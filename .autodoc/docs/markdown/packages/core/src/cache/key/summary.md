[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/core/src/cache/key)

The `key.ts` module in the `core/src/cache/key` directory of the farfetched project provides functions for generating unique keys for caching purposes. These keys are based on the properties of a `query` object and can be used to cache and retrieve data efficiently within the project.

The `createKey` function is a key part of this module. It takes in an object with `sid`, `params`, and `sources` properties. The function uses the `stableStringify` function to convert these properties into a stable string representation. If successful, the `sha1` function from the `hash` module is used to generate a unique hash value from the string, which is then returned as the result. If any errors occur, the function returns `null`.

```typescript
const key = createKey({ sid: '123', params: ['param1', 'param2'], sources: ['source1', 'source2'] });
```

The `queryUniqId` function is another important function in this module. It takes in a `query` object and attempts to extract a unique ID from it. It first tries to extract the `sid` property from the `query` object's `__.meta` property. If the `sid` property does not exist, it tries to extract the `name` property. If the `name` property has been previously encountered, `null` is returned. Otherwise, the `name` property is returned as the unique ID.

```typescript
const uniqId = queryUniqId({ __: { meta: { sid: '123', name: 'query1' } } });
```

If neither the `sid` nor the `name` properties exist in the `query` object's `__.meta` property, an error is thrown. This ensures that every `query` object used for caching has a unique identifier, either in the form of a `sid` or a unique `name`.

These functions are crucial for the efficient caching and retrieval of data in the farfetched project. By generating unique keys for each `query` object, the project can avoid unnecessary data duplication and improve performance.
