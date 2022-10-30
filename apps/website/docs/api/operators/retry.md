# `retry`

Retries a failed [_Query_](../primitives/query.md) with a specified configuration.

## Formulae

### `retry(operation, config)`

::: info
since v0.3.0
:::

Operation could be a [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation).

Config fields:

- `times`: _number_ of _[Store](https://effector.dev/docs/api/effector/store) with a number_ of attempts to retry
- `delay`: _[Sourced](/api/primitives/sourced) number_ with an amount of milliseconds to wait before retrying
- `filter`: _[Sourced](/api/primitives/sourced) boolean_ with a predicate to decide whether to retry or not
- `mapParams?`: optional mapper for the [_Query_](/api/primitives/query) parameters mapping before the next retry, available overloads:
  - `(params, { attempt }) => mapped`
  - `{ source: Store, fn: (params, { attempt }, source) => mapped }`
- `otherwise?`: [_Event_](https://effector.dev/docs/api/effector/event) or [_Effect_](https://effector.dev/docs/api/effector/effect), that will be called after the last attempt if the [_Query_](/api/primitives/query) is still failed

### `retry(config)`

::: warning
This overload is deprecated since v0.3.0 and will be removed in the next release.
:::

Config fields:

- `query`: [_Query_](/api/primitives/query) to retry
- `times`: _number_ of _[Store](https://effector.dev/docs/api/effector/store) with a number_ of attempts to retry
- `delay`: _[Sourced](/api/primitives/sourced) number_ with an amount of milliseconds to wait before retrying
- `filter`: _[Sourced](/api/primitives/sourced) boolean_ with a predicate to decide whether to retry or not
- `mapParams?`: optional mapper for the [_Query_](/api/primitives/query) parameters mapping before the next retry, available overloads:
  - `(params, { attempt }) => mapped`
  - `{ source: Store, fn: (params, { attempt }, source) => mapped }`
- **[since 0.2.0]** `otherwise?`: [_Event_](https://effector.dev/docs/api/effector/event) or [_Effect_](https://effector.dev/docs/api/effector/effect), that will be called after the last attempt if the [_Query_](/api/primitives/query) is still failed

## Build-in delays

You can use the following delays:

- `lineralDelay(base, opts)`
- `exponentialDelay(base, opts)`

Options:

- `randomize.spread`: _number_ with a randomization spread, defaults to `0`

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
