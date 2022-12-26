# Update _Query_ on top of the _Mutation_ result

:::tip You will learn

- Why we need to update _Query_ after _Mutation_
- How to update _Query_ state after _Mutation_ execution
- How to mark _Query_ as stale and force it to re-execute

:::

Since [_Query_](/api/primitives/query) is representation of the data in remote source and [_Mutation_](/api/primitives/mutation) is a way to change data in remote source, it's clear that we need to update [_Query_](/api/primitives/query) after [_Mutation_](/api/primitives/mutation) execution. Let's see how we can do it.

## Update _Query_ on _Mutation_ success

Let's say we have a _Query_ that fetches a list of users and a _Mutation_ that adds a new user to the list. We want to update the list of users after the new user is added. We can do it by using the [`update`](/api/operators/update) operator.

First, we need to create a _Query_ that fetches a list of users:

```ts
import { createJsonQuery } from '@farfetched/core';

const usersListQuery = createJsonQuery({
  request: { url: 'https://api.salo.com/users', method: 'GET' },
  response: { contract: userListContract },
});
```

Then, we need to create a _Mutation_ that adds a new user to the list:

```ts
import { createJsonMutation } from '@farfetched/core';

const addUserMutation = createJsonMutation({
  request: {
    url: 'https://api.salo.com/users',
    method: 'POST',
  },
  response: { contract: userContract },
});
```

If we execute `addUserMutation` with a new user, it will be added to the list of users. But the list of users in `usersListQuery` will not be updated on the client-side. We need to update it manually. We can do it by using the [`update`](/api/operators/update) operator:

```ts
import { update } from '@farfetched/core';

update(usersListQuery, {
  on: addUserMutation,
  by: {
    success: ({ mutation, query }) => ({
      result: [...query.result, mutation.result],
    }),
  },
});
```

Now, when `addUserMutation` is executed successfully, the `usersListQuery` will be updated and new user will be added to the end of the list.

## Re-execute _Query_ after `update`

By default, `update` operator will update the state of the _Query_ but will not re-execute it. If we want to re-execute the _Query_ after `update`, we can use the `refetch` option:

```ts
import { update } from '@farfetched/core';

update(usersListQuery, {
  on: addUserMutation,
  by: {
    success: ({ mutation, query }) => ({
      result: [...query.result, mutation.result],
      refetch: true,
    }),
  },
});
```

Now, when `addUserMutation` is executed successfully, the `usersListQuery` will be updated, market as `$stale` and re-executed.

## Alter _Query_ parameters during `update`

Sometimes we need to alter [_Query_](/api/primitives/query) parameters for re-execution caused by `update`. In this case, we can specify new parameters in `refetch` field`

```ts
import { update } from '@farfetched/core';

update(usersListQuery, {
  on: addUserMutation,
  by: {
    success({ mutation, query }) {
      /* formulate new params there */
      const newParams = null;

      return {
        result: [...query.result, mutation.result],
        refetch: { params: newParams },
      };
    },
  },
});
```

## Update _Query_ on _Mutation_ failure

Sometimes, it's more important to change [_Query_](/api/primitives/query) state after [_Mutation_](/api/primitives/mutation) failure. It can be done by using the `failure` field in `by` object:

```ts
import { update } from '@farfetched/core';

update(usersListQuery, {
  on: addUserMutation,
  by: {
    failure: ({ mutation, query }) => ({
      result: query.result,
      refetch: true,
    }),
  },
});
```

In this case, when `addUserMutation` is failed, the `usersListQuery` will not be updated (because we returned old data from the update-rule), marked as `$stale` and re-executed (because we returned `refetch` option).
