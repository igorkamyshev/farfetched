# `applyBarrier` <Badge type="tip" text="since v0.11.0" />

Applies the [_Barrier_](/api/primitives/barrier) to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation). After operation start it checks the [_Barrier_](/api/primitives/barrier) `.$active` status and postpones the execution if the [_Barrier_](/api/primitives/barrier) is active. After the [_Barrier_](/api/primitives/barrier) is `deactivated`, it resumes the execution of the operation.

## Formulae

### `applyBarrier(operation, { barrier })`

```ts
import { applyBarrier } from '@farfetched/core';

applyBarrier(operation, { barrier });
```

#### Arguments

- `operation` - [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) to apply the [_Barrier_](/api/primitives/barrier) to
- `barrier` - [_Barrier_](/api/primitives/barrier) to apply

### `applyBarrier(operations, { barrier })` <Badge type="tip" text="since v0.12.0" />

```ts
import { applyBarrier } from '@farfetched/core';

applyBarrier([operation1, operation2], { barrier });
```

#### Arguments

- `operations` - Array of [_Queries_](/api/primitives/query) or [_Mutations_](/api/primitives/mutation) to apply the [_Barrier_](/api/primitives/barrier) to
- `barrier` - [_Barrier_](/api/primitives/barrier) to apply
