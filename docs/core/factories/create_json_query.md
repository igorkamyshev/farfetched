# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](../primitives/query.md)

  - You can declare [_Query_](../primitives/query.md) parameters by call `declareParams` function.
  - If not passed, [_Query_](../primitives/query.md) will be created without parameters.

- `request`: declarative rules to formulate request to the API.

  - `method`: _String_ (GET/HEAD/POST/PUT/DELETE/PATCH)
  - `url`: _[Sourced](../primitives/sourced.md) string_
  - `body`: _[Sourced](../primitives/sourced.md) Json_, any value which can be serialized to JSON and parsed back without loses by JavaScript native module JSON. For example, `{ a: 1, b: 2 }`. Note that body cannot be used in `GET` and `HEAD` requests.
  - `query?`: _[Sourced](../primitives/sourced.md) object_, keys of the object must be `String` and values must be `String` or `Array<String>`
  - `headers?`: _[Sourced](../primitives/sourced.md) object_, keys of the object must be `String` and values must be `String` or `Array<String>`

- `response`: declarative rules to handle response from the API.
