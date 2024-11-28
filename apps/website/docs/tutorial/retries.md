# Retries

:::tip You will learn

- How to set up retries
- How to enable or disable retries based on the situation
- How to use dynamic delays between retries
- How to alter parameters between retries

:::

Reties are a pretty common pattern for web application, particular operation can fail because of many reasons, for example because of connectivity problems on the client or short-term server unavailability. In this case, we can retry the request to get the data.

Farfetched provides a set of tools to make retries easy and flexible. Let's take a look at them.

## Set-up retries

To retry a [_Query_](/api/primitives/query), or a [_Mutation_](/api/primitives/mutation) we can use the `retry` operator. It takes an operation itself, number of retries and delay between them. After any error, it will retry the operation after the specified delay.

```ts
import { retry } from '@farfetched/core';

// let's retry our characterQuery
retry(characterQuery, {
  // up to 5 times
  times: 5,
  // with 500ms delay between attempts
  delay: 500,
});
```

This code works is pretty straightforward, after first failure of `characterQuery`, it calls it again after 500ms. If it fails again, it will call it again after 500ms and so on up yo 5 times. If it succeeded, it will stop retrying.

::: tip
Since Farfetched is [based on Effector](/statements/effector), almost every field in its configuration can be either static or reactive. For example, you can pass a [_Store_](https://effector.dev/en/api/effector/store/) containing the number of retries to the `times` option.
:::

## Filter retries

Sometimes, we want to retry only specific errors. For example, we want to retry only 500 errors, but not others. To do this, we can use the `filter` option of the `retry` operator.

```ts
import { isHttpErrorCode } from '@farfetched/core';

retry(characterQuery, {
  times: 5,
  delay: 500,
  // retry only 500 errors
  filter: isHttpErrorCode(500),
});
```

::: info
`isHttpErrorCode` is imported from `@farfetched/core` package, it is a helper function to check if the error is an HTTP error with the specified code. Read more about it in [the API reference](/api/utils/error_guards).
:::

It is only the simplest way to use filter option. Actually, it could be used to disable retries by some external condition. For example, let's see how to allow retries only the particular page of the application.

::: tip
In the following example, we use [Atomic Router](https://atomic-router.github.io) as a router. But you can use any other router or even implement your own.
:::

```ts
retry(characterQuery, {
  times: 5,
  delay: 500,
  filter: characterRoute.$isOpened,
});
```

Also, we can combine the first and the second approaches to retry only 500 errors on the particular page.

```ts
retry(characterQuery, {
  times: 5,
  delay: 500,
  filter: {
    source: characterRoute.$isOpened,
    fn: ({ error, params }, isCharacterRouteOpened) => isCharacterRouteOpened && isHttpErrorCode(500)({ error }),
  },
});
```

::: tip
This type of fields is called [_Sourced_](/api/primitives/sourced) in Farfetched. It is a special type of field that can be either a static value, a [_Store_](https://effector.dev/en/api/effector/store/), a function or the combination of these variants. It is useful to make configs more flexible.
:::

## Dynamic delay

Not only `filter` option is sourced, you can formulate dynamic `delay` as well. For example, you can use linear or exponential back off to retry requests.

```ts
retry(characterQuery, {
  times: 5,
  // linear back off
  delay: ({ attempt }) => attempt * 50,
});
```

::: tip
Even though static `delay` is also supported, we recommend considering using dynamic back off since it is more safe. If your API returned error due to high load, and you are performing retries, you can be sure that you are not overloading it even more.
:::

The most common cases for dynamic delay are linear or exponential back off. Farfetched provides a set of helpers to implement them.

```ts
import { linearDelay, exponentialDelay } from '@farfetched/core';

retry(characterQuery, {
  times: 5,
  delay: linearDelay(50),
});

retry(loginMutation, {
  times: 5,
  delay: exponentialDelay(50),
});
```

## Alter parameters

Sometimes, we want to retry the same request with different parameters. For example, we want to retry the same request, but increased attempt parameter. To do this, we can use the `mapParams` option of the `retry` operator.

```ts
const characterQuery = createQuery({
  handler: async ({ id, attempt }) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}?attempt=${attempt}`);

    return response.json();
  },
});

retry(characterQuery, {
  times: 5,
  delay: 500,
  mapParams: ({ params, error }, { attempt }) => ({
    ...params,
    attempt: attempt,
  }),
});
```

`mapParams` accepts a function that takes current parameters, occurred error and attempt number and returns new parameters. In this example, we just add `attempt` parameter to the current parameters.

## Intermediate errors

By default, `retry` suppress errors, so if the operation failed, it will not be marked as fail until all retries are failed. But sometimes, we want to throw every error. To do this, we can use the `supressIntermediateErrors` option of the `retry` operator.

```ts
retry(characterQuery, {
  times: 5,
  delay: 500,
  supressIntermediateErrors: false,
});
```

## API reference

You can find the full API reference for the `retry` operator in the [API reference](/api/operators/retry).
