---
outline: [2, 3]
---

# Mutation <Badge type="tip" text="since v0.2.0" />

Representation of a mutation of remote data.

## Commands

This section describes the [_Event_](https://effector.dev/docs/api/effector/event) that can be used to perform actions on the _Mutation_. Commands should be called in application code.

### `start`

Unconditionally starts the _Mutation_ with the given parameters.

### `reset` <Badge type="tip" text="since v0.12.0" />

Resets the _Mutation_ to the initial state.

## Stores

This section describes the [_Stores_](https://effector.dev/docs/api/effector/store) that can be used to read the _Mutation_ state.

### `$status`

[_Store_](https://effector.dev/docs/api/effector/store) with the current status of the _Mutation_. It must not be changed directly. Can be one of the following values: `"initial"`, `"pending"`, `"done"`, `"fail"`.

For convenience, there are also the following [_Stores_](https://effector.dev/docs/api/effector/store):

- `$idle` <Badge type="tip" text="since v0.8.0" /> — `true` if the _Mutation_ is in the `"initial"` state, `false` otherwise.
- `$pending` — `true` if the _Mutation_ is in the `"pending"` state, `false` otherwise.
- `$failed` — `true` if the _Mutation_ is in the `"fail"` state, `false` otherwise.
- `$succeeded` — `true` if the _Mutation_ is in the `"done"` state, `false` otherwise.
- `$finished` <Badge type="tip" text="since v0.9.0" /> — `true` if the _Mutation_ is in the `"done"` or `"fail"` state, `false` otherwise.

### `$enabled`

[_Store_](https://effector.dev/docs/api/effector/store) with the current enabled state of the _Mutation_. Disabled _Mutations_ will not be executed, instead, they will be treated as skipped. It must not be changed directly. Can be `true` or `false`.

## Events

This section describes the [_Event_](https://effector.dev/docs/api/effector/event) that can be used to listen to the _Mutation_ state changes. Events must not be called in application code.

### `finished.success`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is finished with success. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Mutation_
- `result` with the result of the _Mutation_
- `meta` with the execution metadata

### `finished.failure`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is finished with failure. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Mutation_
- `error` with the error of the _Mutation_
- `meta` with the execution metadata

### `finished.skip`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is skipped. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Mutation_
- `meta` with the execution metadata

### `finished.finally`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is finished with success, failure or skip. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Mutation_
- `meta` with the execution metadata
- `status` <Badge type="tip" text="since v0.9.0" /> with a string `"done"`, `"fail"` or `"skip"` for success, failure or skip respectively
- `result` <Badge type="tip" text="since v0.9.0" /> if the `status` is `"done"` with the result of the _Mutation_
- `error` <Badge type="tip" text="since v0.9.0" /> if the `status` is `"fail"` with the error of the _Mutation_

### `aborted` <Badge type="tip" text="since v0.10.0" />

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is aborted. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `meta` with the execution metadata

::: info
Aborted _Mutation_ are **not** treated as failed since **v0.10**. This means that `.finished.failure` will not be triggered in case of abortion.
:::

### `started` <Badge type="tip" text="since v0.9.0" />

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Mutation_ is started. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Mutation_
- `meta` with the execution metadata
