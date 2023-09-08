---
outline: [2, 3]
---

# Query

Representation of a piece of remote data.

## Commands

This section describes the [_Event_](https://effector.dev/docs/api/effector/event) that can be used to perform actions on the _Query_. Commands should be called in application code.

### `start`

Unconditionally starts the _Query_ with the given parameters.

### `refresh` <Badge type="tip" text="since v0.8.0" />

Starts the _Query_ with the given parameters if it is `$stale`. Otherwise, it will be treated as skipped.

### `reset` <Badge type="tip" text="since v0.2.0" />

Resets the _Query_ to the initial state.

## Stores

This section describes the [_Stores_](https://effector.dev/docs/api/effector/store) that can be used to read the _Query_ state.

### `$data`

[_Store_](https://effector.dev/docs/api/effector/store) with the latest data. It must not be changed directly. In case of error, it will contain the initial data.

### `$error`

[_Store_](https://effector.dev/docs/api/effector/store) with the latest error. It must not be changed directly. In case of success, it will contain `null`.

### `$status`

[_Store_](https://effector.dev/docs/api/effector/store) with the current status of the _Query_. It must not be changed directly. Can be one of the following values: `"initial"`, `"pending"`, `"done"`, `"fail"`.

For convenience, there are also the following [_Stores_](https://effector.dev/docs/api/effector/store):

- `$idle` <Badge type="tip" text="since v0.8.0" /> — `true` if the _Query_ is in the `"initial"` state, `false` otherwise.
- `$pending` — `true` if the _Query_ is in the `"pending"` state, `false` otherwise.
- `$failed` <Badge type="tip" text="since v0.2.0" /> — `true` if the _Query_ is in the `"fail"` state, `false` otherwise.
- `$succeeded` <Badge type="tip" text="since v0.2.0" /> — `true` if the _Query_ is in the `"done"` state, `false` otherwise.
- `$finished` <Badge type="tip" text="since v0.9.0" /> — `true` if the _Query_ is in the `"done"` or `"fail"` state, `false` otherwise.

### `$enabled`

[_Store_](https://effector.dev/docs/api/effector/store) with the current enabled state of the _Query_. Disabled queries will not be executed, instead, they will be treated as skipped. It must not be changed directly. Can be `true` or `false`.

### `$stale`

[_Store_](https://effector.dev/docs/api/effector/store) with the current stale state of the _Query_. Stale queries will be executed on the next call to `refresh` [_Event_](https://effector.dev/docs/api/effector/event). It must not be changed directly. Can be `true` or `false`.

## Events

This section describes the [_Event_](https://effector.dev/docs/api/effector/event) that can be used to listen to the _Query_ state changes. Events must not be called in application code.

### `finished.success`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is finished with success. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `result` with the result of the _Query_
- `meta` with the execution metadata

### `finished.failure`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is finished with failure. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `error` with the error of the _Query_
- `meta` with the execution metadata

### `finished.skip`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is skipped. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `meta` with the execution metadata

### `finished.finally`

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is finished with success, failure or skip. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `meta` with the execution metadata
- `status` <Badge type="tip" text="since v0.9.0" /> with a string `"done"`, `"fail"` or `"skip"` for success, failure or skip respectively
- `result` <Badge type="tip" text="since v0.9.0" /> if the `status` is `"done"` with the result of the _Query_
- `error` <Badge type="tip" text="since v0.9.0" /> if the `status` is `"fail"` with the error of the _Query_

## `aborted` <Badge type="tip" text="since v0.9.0" />

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is aborted. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `meta` with the execution metadata

::: tip
Now, aborted _Queries_ are treated as failed. This means that `.finished.failure` will be triggered as well as `.aborted`. In v0.10 we will change this behavior and `.aborted` will not trigger `.finished.failure` and _Query_ will not be moved to the `"fail"` state.
:::

## `started` <Badge type="tip" text="since v0.9.0" />

[_Event_](https://effector.dev/docs/api/effector/event) that will be triggered when the _Query_ is started. Payload will contain the object with the following fields:

- `params` with the parameters that were used to start the _Query_
- `meta` with the execution metadata
