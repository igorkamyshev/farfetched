# `stale` <Badge type="tip" text="since v0.8.0" />

Marks the [_Query_](/api/primitives/query) as stale and starts re-fetching it immediately.

## Formulae

```ts
import { stale } from '@farfetched/core';

stale(query, config);
```

Config fields:

- `clock`: [_Event_](https://effector.dev/docs/api/effector/event) after calling which the [_Query_](/api/primitives/query) will be marked as stale and re-fetched immediately
- `params?`: _[Sourced](/api/primitives/sourced) field_ determines parameters of the [_Query_](/api/primitives/query) to be re-fetched; required if the [_Query_](/api/primitives/query) has parameters
