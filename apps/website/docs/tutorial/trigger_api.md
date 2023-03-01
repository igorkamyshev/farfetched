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

keepFresh(someQuery);

sample({ clock: appStarted, target: someQuery.refresh });
```

If you do not want to refresh the data immediately after `$language` is changed, you can use `triggers` field of the `keepFresh`-operator's config to specify the triggers.

```ts
import { keepFresh, createJsonQuery } from '@farfetched/core';

const $language = createStore('en');

const someQuery = createJsonQuery({
  request: {
    url: { source: $language, fn: (_, language) => `/api/${language}` },
  },
});

keepFresh(someQuery, { triggers: [userLoggedIn] });

sample({ clock: appStarted, target: someQuery.refresh });
```
