# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](../primitives/query.md)

  - You can declare [_Query_](../primitives/query.md) parameters by call `declareParams` function.
  - If not passed, [_Query_](../primitives/query.md) will be created without parameters.

- `request`: declarative rules to formulate request to the API.

  - `method` (_`String`_)
  - `url` (_[`Sourced`](../primitives/sourced.md) `String`_)
  - `body` (_[`Sourced`](../primitives/sourced.md) `Json`_)
  - `query?` (_[`Sourced`](../primitives/sourced.md) `Object`_)
  - `headers?` (_[`Sourced`](../primitives/sourced.md) `Object`_)

- `response`: declarative rules to handle response from the API.
