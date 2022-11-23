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

```ts
const $dynamicFaviconEnabled = createStore(false);
```

`createStore` creates [_Store_](https://effector.dev/docs/api/effector/store). It's a place where you can store a value and subscribe to changes.

```ts
const somethingHappened = createEvent();
```

`createEvent` creates [_Event_](https://effector.dev/docs/api/effector/event). It's a way to send a signal and notify subscribers.

```ts
const changeFaviconFx = createEffect({
  handler: () => {
    const fav = document.querySelector('[rel="icon"][type="image/svg+xml"]');
    fav.href = 'other-favicon.svg';
  },
});
```

`createEffect` creates [_Effect_](https://effector.dev/docs/api/effector/effect). It's a way to perform a side effect, like sending a request to the server or changing favicon.

```ts
sample({
  clock: somethingHappened,
  filter: $dynamicFaviconEnabled,
  target: changeFaviconFx,
});
```

`sample` creates connection between `somethingHappened` and `changeFaviconFx`. It means that `changeFaviconFx` will be called when `somethingHappened` happened only if `$dynamicFaviconEnabled` contains `true`.

:::

So, it's time to designs portable and reusable feature flags service for the whole application that will be used by all developers in our frontend team!
