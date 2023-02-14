# Query

Representation of a piece of remote data.

## API reference

```ts
const query: Query<Params, Data, Error>;
const query: Query<Params, Data, Error, InitialData>; // InitialData is allowed since v0.3.0

// Stores
query.$data; // Store<Data | InitialData>
query.$error; // Store<Error | null>
query.$status; // Store<'initial' | 'pending' | 'done' | 'fail'>
query.$idle; // Store<boolean>, since v0.8.0
query.$pending; // Store<boolean>
query.$failed; // Store<boolean>, since v0.2.0
query.$succeeded; // Store<boolean>, since v0.2.0
query.$enabled; // Store<boolean>
query.$stale; // Store<boolean>

// Commands
query.start; // Event<Params>
query.reset; // Event<void>, since v0.2.0

// Events
query.finished.success; // Event<{ result: Data, params: Params }>
query.finished.failure; // Event<{ error: Error, params: Params }>
query.finished.skip; // Event<{ params: Params }>
query.finished.finally; // Event<{ params: Params }>

// Note: Store and Event are imported from 'effector' package
```

More information about API can be found in [the source code](https://github.com/igorkamyshev/farfetched/blob/master/packages/core/src/query/type.ts).
