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

const changeFaviconFx = createEffect(() => {
  const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
  fav.href = 'other-favicon.svg';
});

sample({
  clock: somethingHappened,
  filter: $dynamicFaviconEnabled,
  target: changeFaviconFx,
});
```

::: details I'm not familiar with Effector, could you explain a bit?

Sure!

`createStore` creates [_Store_](https://effector.dev/en/api/effector/store/). It's a place where you can store a value and subscribe to changes.

```ts
const $dynamicFaviconEnabled = createStore(false);
```

`createEvent` creates [_Event_](https://effector.dev/en/api/effector/event/). It's a way to send a signal and notify subscribers.

```ts
const somethingHappened = createEvent();
```

`createEffect` creates [_Effect_](https://effector.dev/en/api/effector/effect/). It's a way to perform a side effect, like sending a request to the server or changing favicon.

```ts
const changeFaviconFx = createEffect(() => {
  const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
  fav.href = 'other-favicon.svg';
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

It's time to find out arguments of the `createFlag` function.

1. `key` — a unique key of the feature flag. It's used to identify the feature flag in the feature flags server.
2. `fetchOn` — we need to know when to fetch the feature flag. It can be an event or list of events. For example, we can fetch the value of the feature flag when the application is initialized.
3. `defaultValue` — we need to know what is the default value of the feature flag. It will be used before the real value is loaded or in case of an error.
4. `contract` — we need to know how to check the value of the feature flag. It will be used to prevent unexpected structure that can break the application. Since Farfetched has a built-in [structure to do it](/api/primitives/contract), we can use it here.

```ts
import { bool } from '@withease/contracts';

const { $value: $dynamicFaviconEnabled } = createFlag({
  key: 'exp-dynamic-favicon',
  defaultValue: false,
  contract: bool,
  fetchOn: applicationInitialized,
});
```

::: tip
We use `@withease/contracts` as a library for creating [_Contracts_](/api/primitives/contract) there. However, you can use any library you want. Read more in [the tutorial](/tutorial/contracts).
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
    body: /* TODO: formulate request's body */,
  },
  response: {
    contract: flagrResponseContract,
  },
});
```

::: info

In this receipt [Flagr](https://github.com/openflagr/flagr) is used as a feature flags service, but it affects only fetching section, so you can you whatever you want.

:::

We use `createJsonQuery` to create a query that will send a request to the feature flags server and receive a response in JSON format. We use `declareParams` to declare that the query accepts an object with `flagKeys` field. It's a list of feature flags keys that we want to receive from the server.

Let's add a rule to start the [_Query_](/api/primitives/query):

```ts
import { createEvent, createStore } from 'effector';

// We will use this event in `createFlag` function to register new keys
const registerNewKey = createEvent<string>();

// Let's store all registered keys for the application
const $requiredKeys = createStore<string[]>([]).on(registerNewKey, (keys, key) => [...keys, key]);

// We will trigger it in `createFlag` function to start fetching of the feature flag
const performRequest = createEvent();

// Connect all together
sample({
  // every time when performRequest is triggered
  clock: performRequest,
  // take all $requiredKeys
  source: $requiredKeys,
  // transform them into an object with a single `flagKeys` field
  fn: (flagKeys) => ({ flagKeys }),
  // and start featureFlagsQuery with it
  target: featureFlagsQuery.start,
});
```

That's it! Now we can start the query when we need to fetch the value of the feature flag.

### Context passing

For sure, we need to pass some application context to the feature flags server, so it can decide which value to return. For example, we can pass the user ID or preferred language to the server to decide whether to enable the feature flag for the user or not.

```ts
import { combine } from 'effector';

// External stores that we want to pass to the feature flags server
// it have to be filled outside of the feature flags service
const $userId = createStore<string | null>(null);
const $language = createStore<string | null>(null);

// Let's combine all external stores into a request context
const $ctx = combine({ userId: $userId, language: $language });

// And use it in the request body
const featureFlagsQuery = createJsonQuery({
  params: declareParams<{ flagKeys: string[] }>(),
  request: {
    method: 'POST',
    url: 'https://flagr.salo.com/',
    body: {
      source: $ctx,
      fn: ({ flagsKeys }, ctx) => createFlagrRequestBody(flagsKeys, ctx),
    },
  },
  response: {
    contract: flagrResponseContract,
  },
});
```

::: details What is `createFlagrRequestBody`?
`createFlagrRequestBody` is a function that creates a request body for Flagr. If you use another service, you can have to a function that creates a request body for it.

```ts
function createFlagrRequestBody(flagKeys, context) {
  return {
    entities: [
      {
        entityID: context.userId,
        entityContext: context,
      },
    ],
    flagKeys,
  };
}
```

:::

### Friendly API

::: info
The internal implementation is written just on top level, it will be shared between all `createFlag` calls.
:::

So, we have an internal implementation that handles fetching, context passing, etc. Now we need to create a public API that will be available in user-land.

```ts
const { $value: $dynamicFaviconEnabled } = createFlag({
  key: 'exp-dynamic-favicon',
  defaultValue: false,
  contract: bool,
  fetchOn: applicationInitialized,
});
```

Let's start with a simple function that registers a new feature:

```ts
import { sample } from 'effector';

function createFlag({ key, requestOn }) {
  sample({
    // every time when requestOn is triggered
    clock: requestOn,
    // take a key
    fn: () => key,
    // and register it
    target: registerNewKey,
  });
}
```

Now, we have to add a fetching logic:

```ts
import { sample } from 'effector';

function createFlag({ key, requestOn }) {
  // ...

  sample({
    // every time when requestOn is triggered
    clock: requestOn,
    // perform fetching
    target: performRequest,
  });
}
```

The last thing we need to do is to return a store with a value of the feature flag:

```ts
function createFlag({ key, requestOn }) {
  // ...

  // find particular flag
  const $value = featureFlagsQuery.$data.map((data) => data.find((flag) => flag.flagKey === key) ?? null);

  return { $value };
}
```

That's it, now let's do some fine-tuning for the `createFlag` function.

### Default value

Because of `?? null` in the previous example, we will receive `null` if the feature flag is not found. It's not what we want, so we have to add a default value:

```ts
function createFlag({ key, requestOn, defaultValue }) {
  // ...

  const $value = featureFlagsQuery.$data.map(
    (data) =>
      // Use defaultValue if the feature flag is not found
      data.find((flag) => flag.flagKey === key) ?? defaultValue
  );

  return { $value };
}
```

### Validation

The last but not the least thing we have to do is to validate the value of the feature flag. For example, we can receive a string from the server, but we expect a boolean value in our application, so, it will be a runtime error. To prevent it, we can use a [_Contract_](/api/primitives/contract)

```ts
function createFlag({ key, requestOn, defaultValue, contract }) {
  // ...

  const $value = featureFlagsQuery.$data
    .map((data) => data.find((flag) => flag.flagKey === key) ?? defaultValue)
    .map((value) => {
      // Check if the value is valid
      if (contract.isData(value)) {
        // if it's valid, return it
        return value;
      } else {
        // otherwise, return a default value
        return defaultValue;
      }
    });

  return { $value };
}
```

Of course, it can be improved a bit. For example, we can use `getErrorMessages` method of the [_Contract_](/api/primitives/contract) to get a list of errors and log them to the console. But it's out of the scope of this article.

### Integration

Now, we have a feature flags service. Let's integrate it with our application.

```ts
import { createEvent, createEffect, sample } from 'effector';
import { bool } from '@withease/contracts';

// Do not forget to call it after application initialization
const applicationInitialized = createEvent();

const { $value: $dynamicFaviconEnabled } = createFlag({
  key: 'exp-dynamic-favicon',
  defaultValue: false,
  contract: bool,
  fetchOn: applicationInitialized,
});

const somethingHappened = createEvent();

const changeFaviconFx = createEffect(() => {
  const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
  fav.href = 'other-favicon.svg';
});

sample({
  clock: somethingHappened,
  filter: $dynamicFaviconEnabled,
  target: changeFaviconFx,
});
```

### What else?

That's it, we have a feature flags service. But it's only a part of the story. There are a lot of things that can be improved:

- retry logic to the `featureFlagsQuery` with a [`retry`](/api/operators/retry) operator
- caching of the `featureFlagsQuery` with a [`cache`](/api/operators/cache) operator
- error handing and logging
- request batching
- ...

## Conclusion

We have created a feature flags service with Effector and Farfetched. It's not a complete solution, but it's a good start. Key points of this article:

- use [_Query_](/api/primitives/query) to fetch data from the remote source
- use [_Contract_](/api/primitives/contract) because [you must not trust remote data](/statements/never_trust)
- hide internal implementation details from end users by creating a friendly API and custom factories
