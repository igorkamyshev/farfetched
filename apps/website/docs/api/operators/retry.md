# `retry`

Retries a failed [_Query_](../primitives/query.md) with a specified configuration.

## Formulae

### `retry(operation, config)` <Badge type="tip" text="since v0.3.0" />

Operation could be a [_Query_](/api/primitives/query) or a [_Mutation_](/api/primitives/mutation).

Config fields:

- `times`: _number_ of _[Store](https://effector.dev/docs/api/effector/store) with a number_ of attempts to retry
- `delay`: _[Sourced](/api/primitives/sourced) [Time](/api/primitives/time)_ with an amount of milliseconds to wait before retrying
- `filter`: _[Sourced](/api/primitives/sourced) boolean_ with a predicate to decide whether to retry or not
- `mapParams?`: optional mapper for the [_Query_](/api/primitives/query) parameters mapping before the next retry, available overloads:
  - `(params, { attempt }) => mapped`
  - `{ source: Store, fn: (params, { attempt }, source) => mapped }`
- `otherwise?`: [_Event_](https://effector.dev/docs/api/effector/event) or [_Effect_](https://effector.dev/docs/api/effector/effect), that will be called after the last attempt if the [_Query_](/api/primitives/query) is still failed
- `supressIntermediateErrors?`: <Badge type="tip" text="since v0.9.0" /> _boolean_ whether to suppress intermediate errors or not, defaults to `true`. If `false`, then the [_Query_](/api/primitives/query) will be marked as failed after the first fail.

## Build-in delays

You can use the following delays:

- `linearDelay(base, opts)`
- `exponentialDelay(base, opts)`

Options:

- `randomize.spread`: _number_ with a randomization spread, defaults to `0`

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
