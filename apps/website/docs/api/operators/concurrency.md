---
outline: [2, 3]
---

# `concurrency` <Badge type="tip" text="since v0.12" />

Applies concurrency settings to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation).

## Formulae

```ts
import { concurrency } from '@farfetched/core';

concurrency(operation, config);
```

Operation could be a [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation).

Config fields:

- `strategy?`: available strategies:
  - _`TAKE_EVERY`_ (**default**) — every request will be executed
  - _`TAKE_LATEST`_ — the latest request will be executed, all previous requests will be aborted
  - _`TAKE_FIRST`_ — the first request will be executed, all subsequent requests will be skipped
- `abortAll?`: [_Event_](https://effector.dev/en/api/effector/event/) after calling which all requests will be aborted immediately

## References

- [ADR: Introduction of concurrency](/adr/concurrency)