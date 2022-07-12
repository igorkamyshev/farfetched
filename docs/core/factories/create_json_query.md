# `createJsonQuery`

## Formulae

### `createJsonQuery(config)`

Config fields:

- `params?`: parameters for the [_Query_](../primitives/query.md)

  - You can declare [_Query_](../primitives/query.md) parameters by call `declareParams` function.
  - If not passed, [_Query_](../primitives/query.md) will be created without parameters.

- `request`: declarative rules to formulate request to the API.

  - `method` (_`String`_): HTTP method for the request
  - `url`: URL for the request, available overloads:
    - _`String`_ will be passed as is
    - _`Store<String>`_ resolves to the current value that will be passed to the request
    - _`(params) => String`_ is called with parameter of the [_Query_](../primitives/query.md), returned value will be passed to the request as a URL
    - _`{ source: Store<String>, fn: (params, source) => String }`_, in this case `fn` will be called with parameter of the [_Query_](../primitives/query.md) and current value of the `source` store, returned value will be passed to the request as a URL
  - `headers?`: headers for the request, available overloads:
    - _`Object<String, String>`_ will be passed as is
    - _`Store<Object<String, String>>`_ resolves to the current value that will be passed to the request
    - _`(params) => Object<String, String>`_ is called with parameter of the [_Query_](../primitives/query.md), returned value will be passed to the request as headers
    - _`{ source: Store<String>, fn: (params, source) => Object<String, String> }`_, in this case `fn` will be called with parameter of the [_Query_](../primitives/query.md) and current value of the `source` store, returned value will be passed to the request as headers
  - `query?`: query parameters for the request, available overloads:
    - _`Object<String, String>`_ will be passed as is
    - _`Store<Object<String, String>>`_ resolves to the current value that will be passed to the request
    - _`(params) => Object<String, String>`_ is called with parameter of the [_Query_](../primitives/query.md), returned value will be passed to the request as query parameters
    - _`{ source: Store<String>, fn: (params, source) => Object<String, String> }`_, in this case `fn` will be called with parameter of the [_Query_](../primitives/query.md) and current value of the `source` store, returned value will be passed to the request as query parameters

- `response`: declarative rules to handle response from the API.
