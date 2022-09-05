# `retry`

Retries a failed [_Query_](../primitives/query.md) with a specified configuration.

## Formulae

### `retry(config)`

Config fields:

- `query`: [_Query_](/api/primitives/query) to retry
- `times`: _number_ of _[Store](https://effector.dev/docs/api/effector/store) with a number_ of attempts to retry
- `delay`: _[Sourced](/api/primitives/sourced) number_ with an amount of milliseconds to wait before retrying
- `filter`: _[Sourced](/api/primitives/sourced) boolean_ with a predicate to decide whether to retry or not
- `mapParams?`: optional mapper for the [_Query_](/api/primitives/query) parameters mapping before the next retry, available overloads:
  - `(params, { attempt }) => mapped`
  - `{ source: Store, fn: (params, { attempt }, source) => mapped }`

## Build-in delays

You can use the following delays:

- `lineralDelay(base)`
- `exponentialDelay(base)`

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
