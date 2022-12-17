# How not to use Fetch API

Since Fetch API is [supported in any modern browser and current version of Node.js](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) Farfetched uses it to make HTTP calls. It adds zero overhead to client bundle and pretty fast on server side. However, in some cases you may want to switch to XMLHttpRequest or some wrappers about it (e.g. [axios](https://axios-http.com)). Let us see how it can be done.

## No Fetch in _Query_

You can use [`createQuery`-factory](/api/factories/create_query.md) and passes your handler to it 👇

```ts
import { createQuery } from '@farfetched/core';
import axios from 'axios';

const usersQuery = createQuery({
  handler: () => axios.get('/users').then((res) => res.data),
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
  handler: ({ login, password }) =>
    axios.post('/login', { login, password }).then((res) => res.data),
});
```

That is it, `loginMutation` is a regular [_Mutation_](/api/primitives/mutation.md) that can be used in any function from Farfetched. Of course, you can use any other library to make HTTP calls the same way.

Furthermore, you can consider [creating a custom _Mutation_ factory](/recipes/custom_mutation) to simplify [_Mutation_](/api/primitives/mutation.md) creation across the application.
