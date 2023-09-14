# `timeout`

Applies a maximum timeout to any operation.
If provided [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation) is not finished in specified [_Time_](api/primitives/time), it will be aborted and resolved with Timeout Error.

## Formulae

### `timeout(operation, config)` <Badge type="tip" text="since v0.10.0" />

Operation could be a [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation).

Config fields:

- `after`: __a [Store](https://effector.dev/docs/api/effector/store) with or just plain [Time](/api/primitives/time)_ with an amount of milliseconds of maximum execution time for a provided operation.
