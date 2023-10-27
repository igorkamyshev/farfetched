# Error guards

Farfetched uses its own object to represent errors for different reasons. To distinguish between these errors, Farfetched provides a set of error guards.

All error guards are functions that take an object with a `error` field as an argument and return a boolean value.

## `isInvalidDataError`

`InvalidDataError` is thrown when the response data is invalid against the given [_Contract_](/api/primitives/contract) or [_Validator_](/api/primitives/validator).

```ts
import { isInvalidDataError } from '@farfetched/core';

const invalidDataInQuery = sample({
  clock: query.finished.failure,
  filter: isInvalidDataError,
});
```

## `isTimeoutError`

`TimeoutError` is thrown when the query takes too long to complete.

```ts
import { isTimeoutError } from '@farfetched/core';

const timedOut = sample({
  clock: query.finished.failure,
  filter: isTimeoutError,
});
```

## `isPreparationError`

Preparation error is thrown when the response cannot be prepared for some reason. For example, when the response is not a JSON string, but supposed to be.

```ts
import { isPreparationError } from '@farfetched/core';

const preparationFailed = sample({
  clock: query.finished.failure,
  filter: isPreparationError,
});
```

## `isHttpError`

`HttpError` is thrown when the response status code is not 2xx.

```ts
import { isHttpError } from '@farfetched/core';

const httpError = sample({
  clock: query.finished.failure,
  filter: isHttpError,
});
```

### `isHttpErrorCode`

This function is a more specific version of `isHttpError`.

#### `isHttpErrorCode(statusCode: number)`

It takes a number as an argument and returns a function that checks if the error is a `HttpError` with the given status code.

```ts
import { isHttpErrorCode } from '@farfetched/core';

const notFound = sample({
  clock: query.finished.failure,
  filter: isHttpErrorCode(404),
});
```

#### `isHttpErrorCode(statusCodes: number[])` <Badge type="tip" text="since v0.9.0" />

It takes an array of numbers as an argument and returns a function that checks if the error is a `HttpError` with one of the given status codes.

```ts
import { isHttpErrorCode } from '@farfetched/core';

const notFoundOrForbidden = sample({
  clock: query.finished.failure,
  filter: isHttpErrorCode([404, 403]),
});
```

## `isNetworkError`

`NetworkError` is thrown when the query fails because of network problems.

```ts
import { isNetworkError } from '@farfetched/core';

const networkProblems = sample({
  clock: query.finished.failure,
  filter: isNetworkError,
});
```
