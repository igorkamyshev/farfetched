# Mutation <Badge type="tip" text="since v0.2.0" />

Representation of a mutation of remote data.

## API reference

```ts
const mutation: Mutation<Params, Data, Error>;

// Stores
mutation.$status; // Store<'initial' | 'pending' | 'done' | 'fail'>
mutation.$idle; // Store<boolean>
mutation.$pending; // Store<boolean>
mutation.$failed; // Store<boolean>
mutation.$pending; // Store<boolean>
mutation.$enabled; // Store<boolean>

// Commands
mutation.start; // Event<Params>;

// Events
mutation.finished.success; // Event<Data>;
mutation.finished.failure; // Event<Error>;
mutation.finished.skip; // Event<void>;
mutation.finished.finally; // Event<void>;

// Note: Store and Event are imported from 'effector' package
```

More information about API can be found in [the source code](https://github.com/igorkamyshev/farfetched/blob/master/packages/core/src/mutation/type.ts).
