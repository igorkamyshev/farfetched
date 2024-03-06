# `onAbort` <Badge type="tip" text="since v0.12" />

Binds a passed function to the aborting of the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation).

```ts
import { onAbort, createQuery } from '@farfetched/core';

const myQuery = createQuery({
  async handler() {
    const abortController = new AbortController();

    onAbort(() => {
      abortController.abort();
    });

    const response = await fetch('https://example.com', {
      signal: abortController.signal,
    });

    return response.text();
  },
});
```

## Limitations

1. `onAbort` can only be called inside the handler of a [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation). Calling it outside a handler will throw an error.
2. `onAbort` can only be called once per handler. Calling it multiple times will throw an error.
3. `onAbort` can only be called before asynchronous operations are started. Calling it after asynchronous operations have started will throw an error.
