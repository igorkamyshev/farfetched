# Query

Representation of a piece of remote data.

## API reference

```ts
const query: Query<Params, Data, Error>;

// Stores
query.$data; // Store<Data | null>;
query.$error; // Store<Error | null>;
query.$status; // Store<'initial' | 'pending' | 'done' | 'fail'>;
query.$pending; // Store<boolean>;
query.$enabled; // Store<boolean>;
query.$stale; // Store<boolean>;

// Commands
query.start; // Event<Params>;

// Events
query.done.success; // Event<Data>;
query.done.error; // Event<Error>;
query.done.skip; // Event<void>;
query.done.finally; // Event<void>;

// Note: Store and Event are imported from 'effector' package
```

More information about API can be found in [the source code](../../../packages/core/src/query/type.ts).
