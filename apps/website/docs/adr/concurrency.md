---
title: Introduction of concurrency

outline: [2, 3]

version: v0.12
---

# Introduction of `concurrency`

This ADR is effective starting from [v0.12](/releases/0-12).

::: tip TL;DR

To apply concurrency settings to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) use [`concurrency` operator](/api/operators/concurrency):

```ts
import { concurrency } from '@farfetched/core';

concurrency(operation, { strategy: 'TAKE_LATEST' });
```

To abort all in-flight requests use `abortAll` [_Event_](https://effector.dev/en/api/effector/event/):

```ts
import { createEvent } from 'effector';
import { concurrency } from '@farfetched/core';

const abortAll = createEvent();

concurrency(operation, { abortAll });
```

By default, no concurrency settings are applied.

Field `concurrency` in factories [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation) will be deleted.

:::

## Configuration vs. Operators

This change is about global movement of Farfetched's API from configuration to operators. Configuration of operation during its creation has a couple of drawbacks:

- It makes creation of custom factories in user-land harder, because they have to support all possible configurations and their combinations. On the other hand, operators are easier to support because they are just functions that can be called with any operation.

- It makes code-generation harder, because it requires to generate the whole configuration object in generated code and user does not have a chance to modify it. On the other hand, operators can be called in separate file and its calls would not be affected by code-generation.

The last but not least, operator is more Effector-ish way of doing things, because any operator is just a set of [`sample`](https://effector.dev/en/api/effector/sample/)-s which is foundation of Effector.

For example, let us take a look at the following code:

```ts
retry(query, {
  times: 12,
});
```

Basically, it can be rewritten as:

```ts
const nextRetry = createEvent();
const $retriesNotExceededLimit = createStore(false);

sample({
  clock: query.finished.failed,
  filter: $retriesNotExceededLimit,
  target: [query.start, nextRetry],
});

sample({
  clock: nextRetry,
  source: $retryNumber,
  fn: (retryNumber) => retryNumber <= 12,
  target: $retriesNotExceededLimit,
});
```

:::tip
It is not a real implementation of `retry` operator, but it is a good example of how it can be implemented using Effector primitives.
:::

So, Farfetched's API is moving from configuration to operators ([`retry`](/api/operators/retry), [`cache`](/api/operators/cache), [`timeout`](/api/operators/timeout), etc.), and this ADR is about moving `concurrency` settings to operator as well.

## Future of `concurrency`

### Historical context

Historically, concurrency settings were applied directly to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) using [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation) factories and `concurrency` field:

```ts
import { createJsonQuery } from '@farfetched/core';

const query = createJsonQuery({
  concurrency: { strategy: 'TAKE_FIRST' },
});
```

Furthermore, `concurrency.strategy` has a default value `TAKE_LATEST` which means that by default, all in-flight requests are aborted except the latest one. But only [_Queries_](/api/primitives/query) created by [`createJsonQuery`](/api/factories/create_json_query) had this default, any other operations had `TAKE_EVERY` as a default.

This behavior is considered harmful and after introducing the [`concurrency`](/api/operators/concurrency) operator, default concurrency strategy is switched to `TAKE_EVERY` for all use-case which means that all in-flight requests are executed concurrently.

### Configuration to operator

Field `concurrency` in [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation) is deprecated. Instead, use [`concurrency`](/api/operators/concurrency) operator.

`strategy` is mapped as is:

```ts
import { createJsonQuery, concurrency } from '@farfetched/core';

const query = createJsonQuery({
  concurrency: { strategy: 'TAKE_LATEST' }, // [!code --]
});

concurrency(query, { strategy: 'TAKE_LATEST' }); // [!code ++]
```

`abort` is renamed to `abortAll`:

```ts
import { createJsonQuery, concurrency } from '@farfetched/core';
import { createEvent } from 'effector';

const abortQuery = createEvent();

const query = createJsonQuery({
  concurrency: { abort: abortQuery }, // [!code --]
});

concurrency(query, { abortAll: abortQuery }); // [!code ++]
```

Furthermore, default concurrency strategy is switched to `TAKE_EVERY`. Before, the default strategy was `TAKE_LATEST` in `createJsonQuery`. Now, all operations have `TAKE_EVERY` as a default which means that all in-flight requests are executed concurrently.

### Changes schedule

Since this change requires a change in the user code, it is scheduled for the couple of releases:

#### v0.12

- Operator [`concurrency`](/api/operators/concurrency) is introduced. It can be used to apply concurrency settings to any [_Queries_](/api/primitives/query) or [_Mutations_](/api/primitives/mutation).
- `concurrency` field in [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation) is deprecated.
- In case of usage operator [`concurrency`](/api/operators/concurrency) with [`createJsonQuery`](/api/factories/create_json_query) **without `concurrency` field**, everything is fine. No deprecation message is written.
- In case of usage operator [`concurrency`](/api/operators/concurrency) with [`createJsonQuery`](/api/factories/create_json_query) **with `concurrency` field**, deprecation message is written with `console.warning`.

#### v0.13

- [`createJsonQuery`](/api/factories/create_json_query) **requires** applying [`concurrency`](/api/operators/concurrency) operator on then to specify concurrency settings. Otherwise, a deprecation message is written with `console.warning`. The reason for this is to make sure that the user is aware of the change of default behavior.

#### v0.14

- `concurrency` field in [`createJsonQuery`](/api/factories/create_json_query) and [`createJsonMutation`](/api/factories/create_json_mutation) is removed. Default strategy is `TAKE_EVERY` for any [_Mutation_](/api/primitives/mutation) or any [_Query_](/api/primitives/query).
