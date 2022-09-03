# SIDs

Farfetched [uses Effector](/statements/effector) that is based on idea of atomic store. It means that any application does not have some centralized state controller or other entry point to collect all states in one place.

So, there is the question — how to distinguish units between different environments? For example, if we ran an application on the server and serialize its state to JSON, how do we know which part of the JSON should be filled in a particular store on the client?

Let's discuss how this problem solved by other state managers.

## Other state managers

### Single store

In the state manager with single store (e.g. Redux), this problem does not exist at all. It is a single store, which can be serialized and deserialized without any additional information. Some tools offer single store like solutions (MobX), some does not try to solve this issue at all (Recoil, Zustand).

:::info
Actually, single store forces you to create unique names of each part of it implicitly. In any object you won't be able to create duplicate keys, so the path to store slice is a unique identifier of this slice.
:::

```ts
// server.ts
import { createStore } from 'single-store-state-manager';

function handlerRequest() {
  const store = createStore({ initialValue: null });

  return {
    // It is possible to just serialize the whole store
    state: JSON.stringify(store.getState()),
  };
}

// client.ts
import { createStore } from 'single-store-state-manager';

// Let's assume that server put the state into the HTML
const serverState = readServerStateFromWindow();

const store = createStore({
  // Just parse the whole state and use it as client state
  initialValue: JSON.parse(serverState),
});
```

It's great that you do not need any additional tools for serialization and deserialization, but single store has a few problems:

- It does not support tree-shaking and code-splitting, you have to load the whole store anyway
- Because its architecture, it requires some additional tools for fixing performance (like `reselect`)
- It does not support any kind of micro-frontends and stuff which is getting bigger recently

### Multi stores

Unfortunately, state managers that built around idea of multi stores do not solve this problem good.

:::info
E.g., the common pattern to solve serialization problem in MobX is [Root Store Pattern](https://dev.to/ivandotv/mobx-root-store-pattern-with-react-hooks-318d) which is destroying the whole idea of multi stores.
:::

So, we are considering SSR as a first class citizen of modern web applications, and we are going to support code-splitting or micro-frontends. It is the reason why Farfetched uses [Effector under the hood](/statements/effector).

## Unique identifiers for every store

Because of multi-store architecture, Effector requires a unique identifier for every store. It is a string that is used to distinguish stores between different environments. In Effector's world this kind of strings are called `sid`.

:::tip TL;DR

`sid` is a unique identifier of a store. It is used to distinguish stores between different environments.

:::

Let's add it to some stores:

```ts
const $name = createStore(null, { sid: 'name' });
const $age = createStore(null, { sid: 'age' });
```

Now, we can serialize and deserialize stores:

```ts
// server.ts
async function handlerRequest() {
  // create isolated instance of application
  const scope = fork();

  // fill some data to stores
  await allSettled($name, { scope, params: 'Igor' });
  await allSettled($age, { scope, params: 25 });

  const state = JSON.serialize(serialize(scope));
  // -> { "name": "Igor", "age": 25 }

  return { state };
}
```

After this code, we have a serialized state of our application. It is a plain object with stores' values. We can put it back to the stores on the client:

```ts
// Let's assume that server put the state into the HTML
const serverState = readServerStateFromWindow();

const scope = fork({
  // Just parse the whole state and use it as client state
  values: JSON.parse(serverState),
});
```

Of course, it's a lot of boring jobs to write `sid` for every store. Effector provides a way to do it automatically with code transformation plugins.

## Plugins for code transformations

<!--@include: ../shared/sids_plugins.md-->

## How plugins work under the hood

Both plugins use the same approach to code transformation. Basically they do two things:

1. add `sid`-s and meta-information to raw Effector's units creation, like `createStore` or `createUnit`
2. wrap custom factories with `withFactory` helper that allow to make `sid`-s of inner units unique as well

Let's take a look at the first point. For the following source code:

```ts
const $name = createStore(null);
```

Plugin will apply these transformations:

```ts
const $name = createStore(null, { sid: 'j3l44' });
```

:::tip
Plugins create `sid`-s as a hash of the file path and the line number where the unit was created. It allows making `sid`-s unique and stable.
:::

So, the second point is about custom factories. For example, we have a custom factory for creating stores:

```ts
function nameStore() {
  const $name = createStore(null);

  const $hasName = $name.map(Boolean);

  return { $name, $hasName };
}

const personOne = nameStore();
const personTwo = nameStore();
```

First, plugin will add `sid`-s to inner units:

```ts
function nameStore() {
  const $name = createStore(null, { sid: 'ffds2' });

  return { $name };
}

const personOne = nameStore();
const personTwo = nameStore();
```

But it's not enough. Because we can create two instances of `nameStore`, and they will have the same `sid`-s. So, plugin will wrap `nameStore` with `withFactory` helper:

```ts
function nameStore() {
  const $name = createStore(null, { sid: 'ffds2' });

  return { $name };
}

const personOne = withFactory({
  sid: 'gre24f',
  fn: () => nameStore(),
});
const personTwo = withFactory({
  sid: 'lpefgd',
  fn: () => nameStore(),
});
```

Now, `sid`-s of inner units are unique, and we can serialize and deserialize them.

```ts
personOne.$name.sid; // gre24f|ffds2
personTwo.$name.sid; // lpefgd|ffds2
```

## How `withFactory` works

`withFactory` is a helper that allows to create unique `sid`-s for inner units. It is a function that accepts an object with `sid` and `fn` properties. `sid` is a unique identifier of the factory, and `fn` is a function that creates units.

Internal implementation of `withFactory` is pretty simple, it puts received `sid` to the global scope before `fn` call, and removes it after. Any Effector's creator function tries to read this global value while creating and append its value to the `sid` of the unit.

```ts
let globalSid = null;

function withFactory({ sid, fn }) {
  globalSid = sid;

  const result = fn();

  globalSid = null;

  return result;
}

function createStore(initialValue, { sid }) {
  if (globalSid) {
    sid = `${globalSid}|${sid}`;
  }

  // ...
}
```

Because of single thread nature of JavaScript, it is safe to use global variables for this purpose.

:::info
Of course, the real implementation is a bit more complicated, but the idea is the same.
:::

## Summary

1. Any multi-store state manager requires unique identifiers for every store to distinguish them between different environments.
2. In Effector's world this kind of strings are called `sid`.
3. Plugins for code transformations add `sid`-s and meta-information to raw Effector's units creation, like `createStore` or `createEvent`.
4. Plugins for code transformations wrap custom factories with `withFactory` helper that allow to make `sid`-s of inner units unique as well.
