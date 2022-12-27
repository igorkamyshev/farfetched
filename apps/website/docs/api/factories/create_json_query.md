# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](/api/primitives/query)

  - You can declare [_Query_](/api/primitives/query) parameters by call `declareParams` function.
  - If not passed, [_Query_](/api/primitives/query) will be created without parameters.

- `initialData?`: initial data of the [_Query_](/api/primitives/query), will be passed to the `$data` store as an initial value

- `request`: declarative rules to formulate request to the API.

  - `method`: _String_
  - `url`: _[Sourced](/api/primitives/sourced) string_
  - `body`: _[Sourced](/api/primitives/sourced) Json_, any value which can be serialized to JSON and parsed back without loses by JavaScript native module JSON. For example, `{ a: 1, b: 2 }`. Note that body cannot be used in `GET` and `HEAD` requests.
  - `query?`: _[Sourced](/api/primitives/sourced) object_, keys of the object must be `String` and values must be `String` or `Array<String>`
  - `headers?`: _[Sourced](/api/primitives/sourced) object_, keys of the object must be `String` and values must be `String` or `Array<String>`

- `response`: declarative rules to handle response from the API.

  - `contract`: [_Contract_](/api/primitives/contract) allows you to validate the response and decide how your application should treat it — as a success response or as a failed one.
  - `validate?`: [_Validator_](/api/primitives/validator) allows you to dynamically validate received data.
  - `mapData?`: optional mapper for the response data, available overloads:
    - `({ result, params }) => mapped`
    - `{ source: Store, fn: (data, { result, params }) => mapped }`

- `concurrency?`: concurrency settings for the [_Query_](/api/primitives/query)

  - `strategy?`: available values:
    - `TAKE_EVERY` execute every request
    - `TAKE_FIRST` skip all requests if there is a pending one
    - `TAKE_LATEST` (**default value**) cancel all pending requests and execute the latest one
  - `abort?`: [_Event_](https://effector.dev/docs/api/effector/event) after calling which all in-flight requests will be aborted

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
