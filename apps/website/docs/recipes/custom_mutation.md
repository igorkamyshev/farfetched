# Custom _Mutation_ creation

::: tip
The process of creating custom factory for [_Mutation_](/api/primitives/mutation.md) is similar to same process for [_Query_](/api/primitives/query.md).
:::

[_Mutation_](/api/primitives/mutation.md) is a simple object with that stores some reactive primitives — [_Event_](https://effector.dev/en/api/effector/event/), [_Effect_](https://effector.dev/en/api/effector/effect/), and [_Store_](https://effector.dev/en/api/effector/store/). It means you can create [_Mutation_](/api/primitives/mutation.md) not only by built-in factories but by your own. E.g. 👇

```ts
function createAsyncStorageMutation({ storageKey }) {
  const start = createEvent();

  const executeFx = createEffect((value) => asyncLocalStorage.setItem(storageKey, value));

  sample({ clock: start, target: executeFx });

  return { start, ... };
}
```

> In this example, some [Effector](https://effector.dev) APIs were used to create [_Query_](/api/primitives/query) — `createEvent`, `createEffect`.

Of course, it looks pretty verbose, so Farfetched provides a special helper that aims to simplify creation of custom [_Mutation_](/api/primitives/mutation.md) factories — `createHeadlessMutation`. Let us rewrite provided example with this helper 👇

```ts
import { createHeadlessMutation } from '@farfetched/core';

function createAsyncStorageMutation({ storageKey }) {
  const executeFx = createEffect((value) =>
    asyncLocalStorage.setItem(storageKey, value)
  );

  const headlessQuery = createHeadlessMutation(/*...*/);
  headlessQuery.__.executeFx.use(executeFx);

  return headlessQuery;
}
```

`createHeadlessMutataion` hides all logic to handle contracts and errors inside, so you only have to provide executor, which will be called to preform mutation.
