---
outline: [2, 3]
---

# Cancellation and Concurrency

:::tip You will learn

- How to cancel in-flight operations
- What concurrency strategies are available out-of-the-box
- Limitations of concurrency applied to operations
- How to react on cancelled operations

:::

## Operator `concurrency`

All concurrency settings are controlled by the [`concurrency` operator](/api/operators/concurrency). It accepts any [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) and configuration object which determines concurrency settings.

### Cancel all in-flight operations

If you want to cancel all in-flight operations, you can use the `abortAll` option. It accepts an [_Event_](https://effector.dev/en/api/effector/event/) that should be called to cancel all in-flight operations.

```ts{10-12}
import { createEvent } from 'effector';
import { concurrency, createQuery } from '@farfetched/core';

const query = createQuery({
  /* ... */
});

const somethingHappened = createEvent();

// Anytime you call `somethingHappened`,
// all in-flight operations will be cancelled immediately
concurrency(query, { abortAll: somethingHappened });
```

### Concurrency strategies

However, if you want to control concurrency on a per-operation basis, you can use the `strategy` option. It accepts one of the following values:

#### `TAKE_EVERY`

In this strategy, every time you call the operation, it will be executed immediately, regardless of whether there are any in-flight operations or not. It is a default strategy for all operations.

```ts{7}
import { concurrency, createQuery } from '@farfetched/core';

const query = createQuery({
  /* ... */
});

concurrency(query, { strategy: 'TAKE_EVERY' });
```

#### `TAKE_LATEST`

By setting this strategy, you ensure that only the latest operation will be executed. If there are any in-flight operations, they will be cancelled immediately.

```ts{7}
import { concurrency, createQuery } from '@farfetched/core';

const query = createQuery({
  /* ... */
});

concurrency(query, { strategy: 'TAKE_LATEST' });
```

#### `TAKE_FIRST`

In this strategy, only the first operation will be executed. If there are any in-flight operations, the new operation execution will be skipped.

```ts{7}
import { concurrency, createQuery } from '@farfetched/core';

const query = createQuery({
  /* ... */
});

concurrency(query, { strategy: 'TAKE_FIRST' });
```

## Limitations

### `onAbort`

::: tip
If you are using [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation), you do not have to worry about the [`onAbort`](/api/utils/on_abort) option. It is handled internally by the library.
:::

[`onAbort`](/api/utils/on_abort) is used to connect the operation's cancellation with internal cancellation mechanism on Farfetched. You have to call this function inside the handler of the operation **before** any asynchronous operation is started.

It works pretty straightforward: when Farfetched cancels the operation, it will call the function you passed to `onAbort`. You can use it to cancel any asynchronous operation you have started.

#### Fetch API example

In case of using the Fetch API, you should use the `onAbort` function to bind a `AbortController` and Farfetched's concurrency mechanism.

```ts{7-9}
import { onAbort, createQuery } from '@farfetched/core';

const query = createQuery({
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

#### `axios` example

The same approach can be used with `axios` library.

```ts{8-10}
import axios from 'axios';
import { onAbort, createQuery } from '@farfetched/core';

const query = createQuery({
  async handler() {
    const abortController = new AbortController();

    onAbort(() => {
      abortController.abort();
    });

    return axios.get('https://example.com', {
      signal: controller.signal,
    });
  },
});
```

### Migration in v0.12-0.14

Originally some debatable decisions were made regarding the `concurrency` in factories [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation). Please, read the [ADR](/adr/concurrency#changes-schedule) to understand the reasons behind the changes and the migration path.

## Reactions

Sometimes you need to react on cancelled operations. For example, you may want to show a message to the user that the operation was cancelled. You can use the `.aborted` [_Event_](https://effector.dev/en/api/effector/event/) of the operation to react on cancellation.

Both [_Query_](/api/primitives/query#aborted) and [_Mutation_](/api/primitives/mutation#aborted) have the `.aborted` event.

```ts{7}
import { createQuery } from '@farfetched/core';

const query = createQuery({
  /* ... */
});

query.aborted // will be called when the operation is cancelled
```

## Mutations

::: danger TL;DR
[`concurrency`](/api/operators/concurrency) supports [_Mutations_](/api/primitives/mutation) as well. However, it is not recommended to use it with [_Mutations_](/api/primitives/mutation) because of its the nature — they are not idempotent, and it is hard to predict the outcome of the operation if it is cancelled.
:::

Let us say we have a [_Mutation_](/api/primitives/mutation) that posts a new comment to the server:

```ts
import { createJsonMutation, declareParams } from '@farfetched/core';

const postCommentMutation = createJsonMutation({
  params: declareParams<{ text: string }>(),
  request: {
    url: '/comments',
    method: 'POST',
  },
});
```

We might want to cancel in flight comment posting if the user decides to post another comment. We can use the `concurrency` operator to achieve this:

```ts
import { concurrency } from '@farfetched/core';

concurrency(postCommentMutation, { strategy: 'TAKE_LATEST' });
```

But it could be potentially dangerous because the server might process the first comment even if it was cancelled. So, to avoid such situations it is important to ensure that the server supports [idempotent operations](https://en.wikipedia.org/wiki/Idempotence), communicate with your backend-team to add support for it.

## References

- [API Reference: operator `concurrency`](/api/operators/concurrency)
- [API Reference: function `onAbort`](/api/utils/on_abort)
- [API Reference: _Event_ `.aborted` of _Query_](/api/primitives/query#aborted)
- [API Reference: _Event_ `.aborted` of _Mutation_](/api/primitives/mutation#aborted)
- [ADR: Introduction of `concurrency`](/adr/concurrency)
- [Deep dive: Data flow in Remote Operation](/recipes/data_flow)
