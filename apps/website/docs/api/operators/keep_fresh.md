# `keepFresh` <Badge type="tip" text="since v0.8.0" />

Refreshes the data in a [_Query_](/api/primitives/query) automatically or on demand.

## Formulae, automatic refresh

Refreshes the data in a [_Query_](/api/primitives/query) automatically if any [_Store_](https://effector.dev/docs/api/effector/store) that is used in the [_Query_](/api/primitives/query) creation is changed.

### `keepFresh(query, { setup })`

Used for [_Query_](/api/primitives/query) with no parameters.

- `setup`: [_Event_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query) due to changes in [_Stores_](https://effector.dev/docs/api/effector/store) that are used in the [_Query_](/api/primitives/query) creation. It is required to pass explicit start [_Event_](https://effector.dev/docs/api/effector/event) to [avoid unexpected behavior](https://withease.pages.dev/magazine/explicit_start.html).

### `keepFresh(query, { params, setup })`

Used for [_Query_](/api/primitives/query) with parameters.

- `params`: _[Store]((https://effector.dev/docs/api/effector/store) with Params_ that is used to determine parameters of the [_Query_](/api/primitives/query) to refresh.
- `setup`: [_Event_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query) due to changes in [_Stores_](https://effector.dev/docs/api/effector/store) that are used in the [_Query_](/api/primitives/query) creation. It is required to pass explicit start [_Event_](https://effector.dev/docs/api/effector/event) to [avoid unexpected behavior](https://withease.pages.dev/magazine/explicit_start.html).

## Formulae, explicit triggers

Refreshes the data in a [_Query_](/api/primitives/query) after any of the specified [_Events_](https://effector.dev/docs/api/effector/event) is triggered.

### `keepFresh(query, { triggers })`

Used for [_Query_](/api/primitives/query) with no parameters.

- `triggers`: _Array_ of [_Events_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query).

### `keepFresh(query, { params, triggers })`

Used for [_Query_](/api/primitives/query) with parameters.

- `params`: _[Sourced](/api/primitives/sourced) field_ that is used to determine parameters of the [_Query_](/api/primitives/query) to refresh.
- `triggers`: _Array_ of [_Events_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query).
