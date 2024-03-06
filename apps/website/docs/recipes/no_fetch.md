# How not to use Fetch API

Since Fetch API is [supported in any modern browser and current version of Node.js](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) Farfetched uses it to make HTTP calls. It adds zero overhead to client bundle and pretty fast on server side. However, in some cases you may want to switch to XMLHttpRequest or some wrappers about it (e.g. [axios](https://axios-http.com)). Let us see how it can be done.

## No Fetch in _Query_

You can use [`createQuery`-factory](/api/factories/create_query.md) and passes your handler to it 👇

```ts
import { createQuery } from '@farfetched/core';
import axios from 'axios';

const usersQuery = createQuery({
  async handler() {
    const response = await axios.get('/users');

    return response.data;
  },
});
```

That is it, `usersQuery` is a regular [_Query_](/api/primitives/query.md) that can be used in any function from Farfetched. Of course, you can use any other library to make HTTP calls the same way.

Furthermore, you can consider [creating a custom _Query_ factory](/recipes/custom_query) to simplify [_Query_](/api/primitives/query.md) creation across the application.

## No Fetch in _Mutation_

::: tip
Farfetched is build over concept re-using, so replacing Fetch API with other HTTP client in [_Mutation_](/api/primitives/mutation.md) is a similar to [_Query_](/api/primitives/query.md) case.
:::

You can use [`createMutation`-factory](/api/factories/create_mutation.md) and passes your handler to it 👇

```ts
import { createMutation } from '@farfetched/core';
import axios from 'axios';

const loginMutation = createMutation({
  async handler({ login, password } {
    const response = await axios.post('/login', { login, password })

    return response.data;
  },
});
```

That is it, `loginMutation` is a regular [_Mutation_](/api/primitives/mutation.md) that can be used in any function from Farfetched. Of course, you can use any other library to make HTTP calls the same way.

Furthermore, you can consider [creating a custom _Mutation_ factory](/recipes/custom_mutation) to simplify [_Mutation_](/api/primitives/mutation.md) creation across the application.

## Cancellation support

Since we took control over HTTP calls from Farfetched, we need to take care about cancellation by ourselves. Fortunately, it is not hard to do. Let us see how it can be done.

Farfetched provides [`onAbort`-function](/api/utils/on_abort.md) that allows to bind a passed function to the aborting of the [_Query_](/api/primitives/query.md) or [_Mutation_](/api/primitives/mutation.md). Let us use it to abort `axios`-based [_Query_](/api/primitives/query.md) 👇

```ts
import { createQuery, onAbort } from '@farfetched/core';
import axios from 'axios';

const usersQuery = createQuery({
  async handler() {
    const controller = new AbortController(); // [!code ++]
    onAbort(() => controller.abort()); // [!code ++]

    const response = await axios.get('/users', {
      signal: controller.signal, // [!code ++]
    });

    return response.data;
  },
});
```

That is it, `usersQuery` supports cancellation now and operators like [`timeout`](/api/operators/timeout.md) will perform cancellation correctly.

You can use the same approach to add cancellation support to [_Mutation_](/api/primitives/mutation.md).
