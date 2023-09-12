[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/core/src)

The `core/src` directory of the farfetched project contains crucial modules for caching, library functions, and updating queries and mutations.

The `cache` subfolder contains modules for managing caching operations. The `cache.ts` module sets up a caching mechanism for queries, with parameters for the adapter, staleness, and purge strategy. It uses the `queryUniqId` function from the `key.ts` module to assign a unique identifier to each query. The `key.ts` module provides functions for generating unique keys based on the properties of a query object. This efficient caching mechanism helps avoid unnecessary data duplication and improve performance.

```typescript
const cacheResult = cache(query, { adapter: 'memory', staleAfter: 60, purge: 'event' });
const key = createKey({ sid: '123', params: ['param1', 'param2'], sources: ['source1', 'source2'] });
const uniqId = queryUniqId({ __: { meta: { sid: '123', name: 'query1' } } });
```

The `libs` subfolder's content is not provided, hence a detailed explanation cannot be given. However, it's likely to contain library functions used across the project.

The `update` subfolder contains the `update.ts` module, which manages and updates queries and mutations. The `update` function takes a query and a mutation object, and updates the query state based on the mutation's result. It also handles refetching logic when necessary.

```javascript
import { update } from 'farfetched';

const query = ...; // define your query
const mutation = ...; // define your mutation
const rules = {
  success: ... // define a rule for handling the success of the mutation
  failure: ... // define a rule for handling the failure of the mutation (optional)
};

update(query, { on: mutation, by: rules });
```

In summary, the `core/src` directory provides key functionalities for the farfetched project, including caching, updating queries and mutations, and possibly library functions.
