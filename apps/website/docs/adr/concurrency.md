---
title: Introduction of concurrency

outline: [2, 3]

version: v0.12
---

# Introduction of `concurrency`

This ADR is effective starting from [v0.12](/releases/0-12).

::: info TL;DR

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

:::

## Configuration vs. Operators

## Future of `concurrency`

Field `concurrency` in `createJsonQuery` and `createJsonMutation` is deprecated.

### Historical context

### Changes

### Migration guide
