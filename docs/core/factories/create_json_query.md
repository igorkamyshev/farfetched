# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](../primitives/query.md)

  - You can declare [_Query_](../primitives/query.md) parameters by call `declareParams` function.
  - If not passed, [_Query_](../primitives/query.md) will be created without parameters.

- `request`: declarative rules to formulate request to the API.

  - `method` (`_String_`): HTTP method for the request
  - `url`: URL for the request, available overloads:
    - `_String_` will be passed as is
    - `_Store<String>_` resolves to the current value that will be passed to the request

- `response`: declarative rules to handle response from the API.
