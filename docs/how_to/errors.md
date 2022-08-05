# How to deal with errors

## Farfetched errors

Farfetched provides a set of built-in error types that represent some failures of fetching. It is used in [`createJsonQuery`-factory](../core/factories/create_json_query.md) and strongly recommended using in [your custom factories](./custom_query.md).

- `InvalidDataError` — [_Contract_](../core/primitives/contract.md) validation failed.
- `TimeoutError` — [_Query_](../core/primitives/query.md) fetching time exceeded limit.
- `AbortError` — [_Query_](../core/primitives/query.md) was aborted due to signal.
- `PreparationError` — response of the [_Query_](../core/primitives/query.md) cannot be prepared for usage in application. E.g., if [_Query_](../core/primitives/query.md) expects JSON and Response is not JSON, this error will be thrown
- `HttpError` — response failed with non-2XX HTTP-code.
- `NetworkError` — response failed due to network problems.

All of these errors are serializable, so they can be used during [SSR](./ssr.md).

## Helpers

Farfetched provides a [set of factories](../../packages/core/src/errors/create_error.ts) that help you create these errors in your code. A [set of guards](../../packages/core/src/errors/guards.ts) to distinguish errors are provided as well.

## Examples

### Handle 401

In many applications, it is necessary to show login screen if some Query was failed due to HTTP error 401.

```ts
// The event is used to send a signal that we need to show the login screen
const requireLogin = createEvent();

requireLogin.watch(() => {
  renderLoginScreen();
});

const privateDataQuery = createJsonQuery({
  request: {
    url: 'http://api.salo.com/private.json',
    method: 'GET' as const,
  },
  response: { contract: unkownContract },
});

sample({
  // when error in query occurred
  clock: privateDataQuery.done.error,
  // check if it is HTTP error 401
  filter: isHttpErrorCode(401),
  // and require login
  target: requireLogin,
});
```

> In this example, some [Effector](https://effector.dev) APIs were used to describe behavior of applications — `createEvent`, `sample`.
