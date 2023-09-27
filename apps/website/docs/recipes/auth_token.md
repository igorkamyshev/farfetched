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

### Barrier application

## What else?

## Conclusion
