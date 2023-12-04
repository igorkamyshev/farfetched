# `timeout` <Badge type="tip" text="since v0.10" />

Applies a maximum timeout to any operation.
If provided [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation) is not finished in specified [_Time_](/api/primitives/time), it will be aborted and resolved with Timeout Error.

## Formulae

### `timeout(operation, config)`

Operation could be a [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation).

Config fields:

- `after`: _a [Store](https://effector.dev/en/api/effector/store/) with or just plain [Time](/api/primitives/time)_ with an amount of milliseconds of maximum execution time for a provided operation.
