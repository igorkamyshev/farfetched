---
outline: [2, 3]
---

# Auth token

There is a popular task in frontend development: to check if the users token is valid before data fetching and perform some actions if it is not. In this case study we will discuss how to implement this task with the help of `@farfetched/core` package.

<!--@include: ../shared/case.md-->

## Kick-off

Let us say we have a website with a login form. After the user submits the form, we send a request to the server and get some token in response. We store this token in the local storage or in the cookies and use it for some subsequent requests.

If something on the website tries to fetch data from the server that requires authentication, we need to check if the token is still valid. If it is not, we need to refresh the token, and continue the previous request.

In different cases, we can have different information about the token. In general, we can divide all cases into two groups:

::: details Client **do** have access to the content of the token

Sometimes the client has access to the content of the token. For example, if the token is stored in the local storage, we can get it with the help of `localStorage.getItem('SOME_KEY')`. In this case, we can check if the token is valid by decoding it and checking the expiration date.

In this case, we assume that the token is a JWT token that contains the expiration date and could be decoded without any additional information.
:::

::: details Client **do not** have access to the content of the token

Sometimes the client does not have access to the content of the token. For example, if the token is stored in the cookie that marked as `httpOnly`, we cannot get it with the help of `document.cookie`. In this case, we need to send a request to the server and check if the response is `200 OK` or `401 Unauthorized`.
:::

These two cases are very similar, so implementation will be the same for both of them with a little difference in the definition of unauthorized access.

## Implementation

Farfetched provides a [_Barrier_](/api/primitives/barrier) abstraction that allows us to implement this task in a declarative way. Its usage splits into two parts: barrier creation and barrier application. Let us start with the barrier creation since it is the most important part.

### Barrier creation

The creation of the barrier depends on the type of the token.

If the client has access to the content of the token, we can create a barrier with explicit checking of the token expiration date.

Let us assume that the token is a JWT token that contains the expiration date and could be decoded without any additional information. Such a token would be stored in a [_Store_](https://effector.dev/docs/api/effector/store) and can be accessed across the application.

```ts{6}
import { createBarrier } from '@farfetched/core';

const $authToken = createStore(/* ... */);

const authBarrier = createBarrier({
  active: combine($authToken, (token) => isTokenInvalid(token)),
});
```

If the client does not have access to the content of the token, we have to rely on the response from the server on particular request. In this case, we can create a barrier with explicit checking of the response status of every request which requires authentication.

```ts{4-6}
import { createBarrier, isHttpErrorCode } from '@farfetched/core';

const authBarrier = createBarrier({
  activateOn: {
    failure: isHttpErrorCode(401),
  },
});
```

It is only difference between these two cases. However, in both cases, we need to refresh the token if it is invalid. Let us say that refreshing the token is a [_Mutation_](/api/primitives/mutation).

```ts{7}
import { createBarrier, createMutation } from '@farfetched/core';

const renewTokenMutation = createMutation(/* ... */);

const authBarrier = createBarrier({
  /* ... */
  perform: [renewTokenMutation],
});
```

Now we have a [_Barrier_](/api/primitives/barrier) that will be activated if the token is invalid and will refresh the token if it is activated. It is time to apply this [_Barrier_](/api/primitives/barrier) to the requests that require authentication.

### Barrier application

This part is very simple. We just need to [`applyBarrier`](/api/operators/apply_barrier) to every [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) that requires authentication.

```ts{5}
import { createQuery, applyBarrier } from '@farfetched/core';

const someQuery = createQuery(/* ... */);

applyBarrier(someQuery, { barrier: authBarrier });
```

That is it! Now every time `someQuery` is called, `authBarrier` will be checked. If the token is invalid, `authBarrier` will be activated, `someQuery` will be suspended, and `renewTokenMutation` will be called. After `renewTokenMutation` is finished, `someQuery` will be resumed in case of suspension or restarted with the latest parameters in case of failure.

## Conclusion

Barrier API is very flexible and allows us to implement different tasks in a declarative way. In this case study, we have discussed how to implement the task of checking the token validity before data fetching.

However, this is not the only task that can be implemented with the help of barriers. You can use them to implement anything that requires some actions to be performed before particular operation with suspension of this operation until the actions are finished.
