# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](../primitives/query.md)

  - You can declare [_Query_](../primitives/query.md) parameters by call `declareParams` function.
  - If not passed, [_Query_](../primitives/query.md) will be created without parameters.

- `request`: declarative rules to formulate request to the API.

  - `method`: _`String`_)
  - `url`: _[`Sourced`](../primitives/sourced.md) `String`_
  - `body`: _[`Sourced`](../primitives/sourced.md) `Json`_, any value which can be serialized to JSON and parsed back without loses by JavaScript native module `JSON`. For example, `{ a: 1, b: 2 }`
  - `query?`: _[`Sourced`](../primitives/sourced.md) `Object`_, keys of the object must be `String` and values must be `String` or `Array<String>`
  - `headers?`: _[`Sourced`](../primitives/sourced.md) `Object`_, keys of the object must be `String` and values must be `String` or `Array<String>`

- `response`: declarative rules to handle response from the API.
