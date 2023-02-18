# Error creators

Farfetched uses its own object to represent errors for different reasons. To create these errors, Farfetched provides a set of error creators.

All error creators are functions that take an object with a configuration of an error and return an internal representation of the error.

:::tip
All errors are serializable, so they can be safely transmitted through network.
:::

E.g., you can use error creators to [create your own factory](/recipes/custom_query) and want to reuse existing error handling infrastructure in Farfetched, or to imitate these errors in tests.

## `invalidDataError`

`InvalidDataError` is thrown when the response data is invalid against the given [_Contract_](/api/primitives/contract) or [_Validator_](/api/primitives/validator).

```ts
import { invalidDataError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw invalidDataError({
            validationErrors: ['Test error'],
            response: {},
          });
        }),
      ],
    ],
  });
});
```

## `timeoutError`

`TimeoutError` is thrown when the query takes too long to complete.

```ts
import { timeoutError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw timeoutError({
            timeout: 10,
          });
        }),
      ],
    ],
  });
});
```

## `abortError`

`AbortError` is thrown when the query is aborted.

```ts
import { abortError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw abortError();
        }),
      ],
    ],
  });
});
```

## `preparationError`

Preparation error is thrown when the response cannot be prepared for some reason. For example, when the response is not a JSON string, but supposed to be.

```ts
import { preparationError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw preparationError({ reason: 'Weird JSON', response: '{lolkek' });
        }),
      ],
    ],
  });
});
```

## `httpError`

`HttpError` is thrown when the response status code is not 2xx.

```ts
import { httpError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw httpError({
            status: 429,
            statusText: 'I am teapot',
            response: null,
          });
        }),
      ],
    ],
  });
});
```

## `networkError`

`NetworkError` is thrown when the query fails because of network problems.

```ts
import { networkError } from '@farfetched/core';

test('on error', async () => {
  const scope = fork({
    handlers: [
      [
        query.__.executeFx,
        vi.fn(() => {
          throw networkError({
            reason: 'Can not',
          });
        }),
      ],
    ],
  });
});
```
