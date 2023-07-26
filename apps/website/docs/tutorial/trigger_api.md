# Trigger API

:::tip You will learn

- What means that the data in a [_Query_](/api/primitives/query) is fresh (and stale)
- How to refresh the data in a [_Query_](/api/primitives/query) manually
- How to refresh the data in a [_Query_](/api/primitives/query) automatically by different triggers

:::

In the previous chapters, we learned how to fetch data from the server and how to display it. Now let us talk about how to keep the data fresh.

## `.$stale` property of the [_Query_](/api/primitives/query)

Every [_Query_](/api/primitives/query) has a `.$stale` property. It is a [_Store_](https://effector.dev/docs/api/effector/store) that contains a boolean value. It is `true` when the data in the [_Query_](/api/primitives/query) is stale, and `false` when it is fresh.

By default, it is `true` because the [_Query_](/api/primitives/query) is not fetched yet.

Data becomes stale when the [_Query_](/api/primitives/query) in many cases:

1. if it is [updated after _Mutation_ execution](/tutorial/update_query)
2. if it is [dependent on another _Query_](/tutorial/dependent_queries) and the parent _Query_ data is updated
3. if its value is extracted from [cache](/tutorial/caching) and the cache is not marked as fresh

In all these cases, the `.$stale` property of the [_Query_](/api/primitives/query) becomes `true` and the [_Query_](/api/primitives/query) immediately starts the process of refreshing the data.

## Refresh the data manually

Sometimes you want to start a [_Query_] only if the data is stale and skip it if the data is fresh. For example, you got the data from the server and do not want to fetch it again until on client. For this case, you can use the `.refresh` [_Event_](https://effector.dev/docs/api/effector/event) of the [_Query_](/api/primitives/query).

```ts
import { sample } from 'effector';
import { createJsonQuery } from '@farfetched/core';

const someQuery = createJsonQuery({
  /* ... */
});

sample({ clock: appStarted, target: someQuery.refresh });
```

In this example, the `someQuery` will be started only every time when the `appStarted` event is triggered and the data in the `someQuery` is stale. You can safely call the `appStarted` on the server, transfer the data to the client, and call the `appStarted` on the client. The `someQuery` will be started only on the server and will be skipped on the client.

## Refresh the data automatically

In the most cases, you want to refresh the data automatically during the lifetime of the app. For this case, you can use the [`keepFresh`](/api/operators/keep_fresh)-operator.

The following example shows how to refresh the `someQuery` every time when `$language` store is changed, but only after the `appStarted` event is triggered.

```ts
import { keepFresh, createJsonQuery } from '@farfetched/core';

const $language = createStore('en');

const someQuery = createJsonQuery({
  request: {
    url: { source: $language, fn: (_, language) => `/api/${language}` },
  },
});

keepFresh(someQuery, {
  automatically: true,
});

sample({ clock: appStarted, target: someQuery.refresh });
```

If you do want to refresh the data immediately after some external trigger, you can use `triggers` field of the `keepFresh`-operator's config to specify the triggers.

```ts
import { keepFresh, createJsonQuery } from '@farfetched/core';

const $language = createStore('en');

const someQuery = createJsonQuery(/* ... */);

keepFresh(someQuery, { triggers: [userLoggedIn] });

sample({ clock: appStarted, target: someQuery.refresh });
```

### External triggers

Trigger API is based on [`@@trigger`-protocol](https://withease.pages.dev/protocols/trigger.html), so any library that implements this protocol can be used as a trigger.

#### Web APIs

It could be really useful to refresh the data on some application wide triggers like tab visibility or network reconnection. This kind of triggers is out of scope of Farfetched, so they are distributed as [separated package — `@withease/web-api`](https://withease.pages.dev/web-api).

::: code-group

```sh [pnpm]
pnpm install @withease/web-api
```

```sh [yarn]
yarn add @withease/web-api
```

```sh [npm]
npm install @withease/web-api
```

:::

It is compatible with Farfetched and can be used without any additional configuration.

```ts
import { trackPageVisibility, trackNetworkStatus } from '@withease/web-api';
import { keepFresh } from '@farfetched/core';

keepFresh(someQuery, {
  triggers: [trackPageVisibility, trackNetworkStatus],
});
```

Check [documentation of `@withease/web-api`](https://withease.pages.dev/web-api) for the complete list of available triggers.

#### Interval

If you want to refresh the data every N seconds, you can use the `interval` method from [patronum](https://patronum.effector.dev/) which is library with numerous utilities for Effector.

::: code-group

```sh [pnpm]
pnpm install patronum
```

```sh [yarn]
yarn add patronum
```

```sh [npm]
npm install patronum
```

:::

It is compatible with Farfetched and can be used without any additional configuration.

```ts
import { keepFresh } from '@farfetched/core';
import { interval } from 'patronum';

keepFresh(someQuery, {
  // 👇 someQuery will be refreshed every 5 seconds
  triggers: [interval({ timeout: 5000 })],
});
```

Check [documentation of `patronum/interval`](https://patronum.effector.dev/methods/interval/) for the complete documentation.

### Mix automatic and manual refresh

You can mix automatic and manual refresh:

```ts
keepFresh(someQuery, {
  automatically: true,
  triggers: [userLoggedIn],
});
```

## API reference

You can find the full API reference for the `keepFresh` operator in the [API reference](/api/operators/keep_fresh).
