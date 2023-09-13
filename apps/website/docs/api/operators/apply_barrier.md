# `applyBarrier` <Badge type="tip" text="since v0.10.0" />

Applies the [_Barrier_](/api/primitives/barrier) to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation). After operation start it checks the [_Barrier_](/api/primitives/barrier) `.$active` status and postpones the execution if the [_Barrier_](/api/primitives/barrier) is active. After the [_Barrier_](/api/primitives/barrier) is `deactivated`, it resumes the execution of the operation.

## Formulae

```ts
import { applyBarrier } from '@farfetched/core';

applyBarrier(operation, { barrier, resumeParams });
```

### Arguments

- `operation` - [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) to apply the [_Barrier_](/api/primitives/barrier) to
- `barrier` - [_Barrier_](/api/primitives/barrier) to apply
- `resumeParams?` — optional rule to alter the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) parameters when the [_Barrier_](/api/primitives/barrier) is deactivated, available overloads:
  - `(params) => nextParams`
  - `{ source: Store, fn: (params, source) => nextParams }`
