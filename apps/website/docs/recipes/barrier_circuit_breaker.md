# Barrier Circuit Breaker

> Recipe based on the question from [issue #458](https://github.com/igorkamyshev/farfetched/issues/458)

Let us assume we have a basic [_Barrier_](https://farfetched.dev/docs/api/barrier) that is activated on a 401 HTTP error code. The barrier is used to renew the token after failing to access the protected resource.

```ts
import { createBarrier, isHttpErrorCode } from '@farfetched/core';

const authBarrier = createBarrier({
  activateOn: {
    failure: isHttpErrorCode(401),
  },
  perform: [renewTokenMutation],
});
```

::: tip

It is a basic example based on the case-study [Auth token](/recipes/auth_token).

:::

In this setup, it is possible to get infinite loops if the token renewal in case of some mistake in [_Query_](/api/primitives/query) declaration. For example, if we made a typo in the header name, the [_Barrier_](https://farfetched.dev/docs/api/barrier) will be activated on every request, and the token will be renewed every time, which will not lead to successful [_Query_](/api/primitives/query) execution.

```ts
import { createJsonQuery, applyBarrier } from '@farfetched/core';

const buggyQuery = createJsonQuery({
  request: {
    method: 'GET',
    url: 'https://api.salo.com/protected',
    headers: combine($authToken, (token) => ({
      // 👇 typo in header name
      Authorisation: `Bearer ${token}`,
    })),
  },
  // ...
});

applyBarrier(buggyQuery, { barrier: authBarrier });
```

## Solution

In this case, we can write some kind of circuit breaker that will stop the token renewal after a certain number of attempts.

```ts
function barrierCircuitBreaker(barrier, { maxAttempts }) {
  const $currentAttempt = createStore(0).on(
    // every time after the Barrier is performed
    barrier.performed,
    // increment the current attempt
    (attempt) => attempt + 1
  );

  sample({
    // If the number of attempts exceeds the limit,
    clock: $currentAttempt,
    filter: (currentAttempt) => currentAttempt >= maxAttempts,
    target: [
      // force the Barrier to deactivate
      barrier.forceDeactivate,
      // and reset the current attempt counter
      $currentAttempt.reinit,
    ],
  });
}
```

This function can be applied to the existing [_Barrier_](https://farfetched.dev/docs/api/barrier) to limit the number of attempts to renew the token 👇

```ts
barrierCircuitBreaker(authBarrier, { maxAttempts: 3 });
```

That is it, `authBarrier` will perform the token renewal only three times, and after that, it will be deactivated forcibly, so all [_Queries_](/api/primitives/query) will fail with the 401 HTTP error code.
