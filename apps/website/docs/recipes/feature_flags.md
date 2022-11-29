---
outline: [2, 3]
---

# Feature flags service

Let's talk about feature flags. Feature flags are a way to enable or disable a feature in your application. They are used to testing new features, to roll out new features to a subset of users, or to disable a feature in case of an emergency.

<!--@include: ../shared/case.md-->

## Kick-off

Let's say you have a new feature that you want to test — **dynamic favicon that changes after some activity in the application**. It's a cool feature, but you don't want to release it to all users at once. You want to test it first, do some math calculating profit increase, and then release it to a subset of users.

So, you need to create a feature flag for this feature:

```ts
import { createStore } from 'effector';

const $dynamicFaviconEnabled = createStore(false);
```

The default value is `false`, so the feature is disabled by default. However, our manager wants to have the ability to enable the feature for a subset of users. So, we need to fetch the value from the server that will be responsible for feature flags management. We will do it later.

Now you can use this flag to enable feature in the application:

```ts
import { createEvent, createEffect, sample } from 'effector';

const somethingHappened = createEvent();

const changeFaviconFx = createEffect({
  handler: () => {
    const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
    fav.href = 'other-favicon.svg';
  },
});

sample({
  clock: somethingHappened,
  filter: $dynamicFaviconEnabled,
  target: changeFaviconFx,
});
```

::: details I'm not familiar with Effector, could you explain a bit?

Sure!

`createStore` creates [_Store_](https://effector.dev/docs/api/effector/store). It's a place where you can store a value and subscribe to changes.

```ts
const $dynamicFaviconEnabled = createStore(false);
```

`createEvent` creates [_Event_](https://effector.dev/docs/api/effector/event). It's a way to send a signal and notify subscribers.

```ts
const somethingHappened = createEvent();
```

`createEffect` creates [_Effect_](https://effector.dev/docs/api/effector/effect). It's a way to perform a side effect, like sending a request to the server or changing favicon.

```ts
const changeFaviconFx = createEffect({
  handler: () => {
    const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
    fav.href = 'other-favicon.svg';
  },
});
```

`sample` creates connection between `somethingHappened` and `changeFaviconFx`. It means that `changeFaviconFx` will be called when `somethingHappened` happened only if `$dynamicFaviconEnabled` contains `true`.

```ts
sample({
  clock: somethingHappened,
  filter: $dynamicFaviconEnabled,
  target: changeFaviconFx,
});
```

:::

So, it's time to designs portable and reusable feature flags service for the whole application that will be used by all developers in our frontend team!

## Design

Let's list all the requirements:

1. Fetch the value of the feature flag from the server after the feature module is initialized and batch requests to the feature flags server to make it more efficient.
2. Pass some application context to the feature flags server, so it can decide which value to return.
3. Allow using default value for the feature flag before the real one is loaded or in case of an error. Also, we need a way to distinguish between the default value and the real one in the application.
4. Validate the value of the feature flag on the client side to prevent unexpected structure that can break the application.

Bonus requirement: let's make it friendly for application developers. They should not care about the implementation details of the feature flags service and be able to use it independently in different products inside the application.

So, to meet these requirements, we need to create a function that will accept configuration of the particular feature flag (when we have to fetch it, what is the default value, etc.) and return something that can be used in the application.

```ts
const { $value: $dynamicFaviconEnabled } = createFlag({
  /* ... */
});
```

::: tip Why does a function return object with `$value` field instead of single `$value`?

For now, we use only `$value` in the application, but we can add more fields in the future. For example, we can add `$loading` field that will be `true` while the value is loading and `false` otherwise. So, in general, it's a good practice to return an object from a factory instead of a single value. It allows us to add more fields in the future without breaking the API.

We do the same for `createFlag` arguments by passing an object instead of a list of arguments. It allows us to add more fields in the future without breaking the API.

:::

## Implementation

Let's split our implementation into two parts:

- internal implementation that will handle fetching, context passing, etc.
- public API that will be available in user-land

### Fetching

First we have to create [_Query_](/api/primitives/query) to receive information about feature flags from remote source.

```ts
import { createJsonQuery, declareParams } from '@farfetched/core';

const featureFlagsQuery = createJsonQuery({
  params: declareParams<{ flagKeys: string[] }>(),
  request: {
    method: 'POST',
    url: 'https://flagr.salo.com/',
  },
  response: {
    contract: flagrResponseContract,
  },
});
```

::: info

In this receipt [Flagr](https://github.com/openflagr/flagr) is used as a feature flags service, but it affects only fetching section, so you can you whatever you want.

:::

### Context passing

### Friendly API

### Default value

### Validation

## Integration

## Conclusion
