# Built-in factories for Mutations

:::tip You will learn

- Why do we need built-in factories
- How to use built-in factories
- How to create your own factory

:::

## JSON API

Since Farfetched provides `createJsonQuery` to create [_Queries_](/api/primitives/query) that work with JSON API, it also provides `createJsonMutation` to create [_Mutations_](/api/primitives/mutation) that work with JSON API.

Let's start with an example, and then we'll explain what's going on.

```ts
import { createJsonMutation } from '@farfetched/core';

const loginMutation = createJsonMutation({
  params: declareParams<{ login: string; password: string }>(),
  request: {
    method: 'POST',
    url: 'https://api.salo.com/login',
    body: ({ login, password }) => ({ credentials: { login, password } }),
  },
  response: {
    contract: unknownContract,
    status: { expected: 204 },
  },
});
```

### Parameters declaration

Parameters declaration is the same as in `createJsonQuery`, it is literally the same function.

### Request

`request` field of the config is dedicated to description of the request to the API. It has plenty fields, which are listed in [the API reference](/api/factories/create_json_mutation), for now let's concentrate on the most important ones.

- `request.method` has to be a _string_ with an HTTP method in uppercase, e.g. `GET` or `POST`.
- `request.url` is used to formulate a URL of the request, in our case it is just a static string.
- `request.body` is a function to formulate request body based on the parameters. It is optional, and if it is not provided, the request will not have a body.

```ts{3-7}
const loginMutation = createJsonMutation({
  params: declareParams<{ login: string; password: string }>(),
  request: {
    method: 'POST',
    url: 'https://api.salo.com/login',
    body: ({ login, password }) => ({ credentials: { login, password } }),
  },
  response: {
    contract: unknownContract,
    status: { expected: 204 },
  },
});
```

### Response

`response` field of the config is dedicated to description of the response from the API. It has plenty fields, which are listed in [the API reference](/api/factories/create_json_mutation), for now let's concentrate on the most important ones.

- `response.contract` is used to describe the shape of the response, it has to be a [_Contract_](/api/primitives/contract) object. In our case, we use `unknownContract` to say that we don't know the shape of the response, and we don't care about it.
- `response.status.expected` is used to describe the status of the response, it has to be an object with `expected` field that has to be a _number_ or _array of numbers_. In our case, we expect that the response will have status `204`.

```ts{8-11}
const loginMutation = createJsonMutation({
  params: declareParams<{ login: string; password: string }>(),
  request: {
    method: 'POST',
    url: 'https://api.salo.com/login',
    body: ({ login, password }) => ({ credentials: { login, password } }),
  },
  response: {
    contract: unknownContract,
    status: { expected: 204 },
  },
});
```

### What's else?

`createJsonMutation` does some additional job to make your life easier. It does the following:

- Add `Content-Type: application/json` header to the request
- Parse the response as JSON (if the response has a body)

## Custom factories

Sometimes you need to create a bunch of [_Mutations_](/api/primitives/mutation) that are not covered by built-in factories and do not want to do the same job many times for every [_Mutation_](/api/primitives/mutation). In this case, you can create your own factory.

Read more about it [in custom factories' recipe](/recipes/custom_mutation).
