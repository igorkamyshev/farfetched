---
title: Deprecation of attachOperation

outline: [2, 3]

version: v0.12
---

# Deprecation of `attachOperation`

This ADR is effective starting from [v0.12](/releases/0-12).

::: info TL;DR
`attachOperation` is a bad abstraction because it is not clear what it does, and it is not clear what it is supposed to do. Furthermore, it can be replaced by a more explicit and more flexible plain JS functions.

```ts
/* [!code ++:3] */ function createOriginalQuery() {
  return createQuery(/*...*/);
}

const originalQuery = createQuery(/*...*/); // [!code --]
const originalQuery = createOriginalQuery(); // [!code ++]

const copiedQuery = attachOperation(originalQuery); // [!code --]
const copiedQuery = createOriginalQuery(); // [!code ++]
```

:::

## Issues with `attachOperation`

Let us take a closer look at problems with `attachOperation`.

### Understanding

`attachOperation` is a function that takes a _Query_ (or _Mutation_) and returns a copy of it. However, it is not clear what it does with some additional behavior added to _Query_. For example, let us say that we have the following code:

```ts
import { createQuery, cache, attachOperation } from '@farfetched/core';

const originalQuery = createQuery(/*...*/);

cache(originalQuery);

const copiedQuery = attachOperation(originalQuery);
```

Should `copiedQuery` be cached? Should it use the same cache strategy as `originalQuery`, or should it share cache with `originalQuery`? The answer is not clear, and it is not clear because `attachOperation` is not a good abstraction.

However, if we replace `attachOperation` with a plain JS function, it becomes clear what it does:

```ts
import { createQuery, cache } from '@farfetched/core';

function createOriginalQuery() {
  const q = createQuery(/*...*/);

  cache(q);

  return q;
}

const originalQuery = createOriginalQuery();
const copiedQuery = createOriginalQuery();
```

Now it is crystal clear that `copiedQuery` should be cached with the same cache strategy as `originalQuery`, but they should not share cache.

The same applies to other behaviors that can be added to _Query_ or _Mutation_. For example, the following code example:

```ts
import { createQuery, retry, attachOperation } from '@farfetched/core';

const originalQuery = createQuery(/*...*/);

retry(originalQuery, {
  times: 5,
});

const copiedQuery = attachOperation(originalQuery);
```

Same questions. Should `copiedQuery` retry? Should it use the same retry strategy as `originalQuery`, or should it share the whole retry state (how many retries are already over, etc.) with `originalQuery`? Replacing `attachOperation` with a plain JS function makes it clear and explicit:

```ts
import { createQuery, retry } from '@farfetched/core';

function createOriginalQuery() {
  const q = createQuery(/*...*/);

  retry(q, {
    times: 5,
  });

  return q;
}

const originalQuery = createOriginalQuery();
const copiedQuery = createOriginalQuery();
```

Since we are trying to make Farfetched as explicit as possible, we should not use `attachOperation` anymore.

### Extensibility

`attachOperation` is mimic of `attach` from Effector which has an ability of altering parameters of the original _Effect_. This ability was copied "as is" to `attachOperation`, and it works great. However, _Query_ and _Mutation_ are way more complex than _Effect_, so it is required to extend `attachOperation` for almost every new feature. A couple of examples:

- [Feature request: `mapData` for `attachOperation`](https://github.com/igorkamyshev/farfetched/issues/264)
- [Feature request: altering `concurrency` in `attachOperation`](https://github.com/igorkamyshev/farfetched/issues/222)

The solution is to replace `attachOperation` with a plain JS function does not require any changes because it is just a function. Users can alter it as they want without any limitations.

## Future of `attachOperation`

### How to migrate

Let us describe migration paths for all possible use cases of `attachOperation`.

::: tip
You can check an example of migration of [SolidJS Real-world Example](https://github.com/igorkamyshev/farfetched/pull/414/commits/031a37c0e84de05679d513e756c848f3f275cae8).
:::

#### `attachOperation(originalQuery)`

This overload is used to create a copy of _Query_ or _Mutation_ without any modifications. It can be replaced with a plain JS function:

```ts
/* [!code ++:3] */ function createOriginalQuery() {
  return createQuery(/*...*/);
}

const originalQuery = createQuery(/*...*/); // [!code --]
const originalQuery = createOriginalQuery(); // [!code ++]

const copiedQuery = attachOperation(originalQuery); // [!code --]
const copiedQuery = createOriginalQuery(); // [!code ++]
```

::: tip `@withease/factories`

If your application has [SSR](/recipes/ssr) you can use `@withease/factories` to create a factory function with ease:

```ts
import { createFactory } from '@withease/factories'; // [!code ++]

const createOriginalQuery = createFactory(() => { // [!code ++]
function createOriginalQuery() { // [!code --]
  return createQuery(/*...*/);
});
```

Read more about it in [the documentation of `@withease/factories`](https://withease.pages.dev/factories/).
:::

#### `attachOperation(originalQuery, { mapParams })`

This overload allows altering parameters of the original _Query_ or _Mutation_. It can be replaced with a plain JS function as well:

```ts
/* [!code ++:8] */ function createOriginalQuery({ mapParams } = {}) {
  return createQuery({
    effect(rawParams) {
      const params = mapParams ? mapParams(rawParams) : rawParams;
      return fetch(/*...*/);
    },
  });
}

/* [!code --:5] */ const originalQuery = createQuery({
  effect(params) {
    return fetch(/*...*/);
  },
});
const originalQuery = createOriginalQuery(); // [!code ++]

/* [!code --:3] */ const copiedQuery = attachOperation(originalQuery, {
  mapParams: p + 1,
});

const copiedQuery = createOriginalQuery({ mapParams: (p) => p + 1 }); // [!code ++]
```

### Deletion schedule

- `attachOperation(originalQuery)` will be marked as deprecated in **v0.12** with a warning in JSDoc and on TS-level.
- `attachOperation(originalQuery)` will start writing deprecation message with `console.warning` in **v0.13**.
- `attachOperation(originalQuery)` will be deleted in **v0.14**.
