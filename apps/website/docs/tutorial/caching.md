# Caching

:::tip You will learn

- What is a browser cache and how to use it
- When it is reasonable to use custom caching
- Where to store cached data
- How to invalidate cache
- How skip requests if data is already cached

:::

## Browser cache

Browsers have a built-in cache for HTTP requests — [HTTP cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching). It is a great tool to improve performance of your application that allows you to avoid unnecessary requests to the server and reduce the load on it.

::: info Example
[Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/) in the Farfetched repository is using HTTP cache. Try to walk through the application and observe — after the initial load it is blazing fast because of proper HTTP cache headers in API.
:::

Browser cache is build on top of HTTP headers, so this mechanism cannot be controlled directly by frontend applications.

- If you are using [**Backend-for-frontend**](https://samnewman.io/patterns/architectural/bff/) architecture, you can set proper HTTP cache headers on your BFF.
- If your frontend application calls **a separated backend**, you can communicate with your backend team to about proper HTTP cache headers.

::: tip Further reading
Read more about HTTP caching on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching).
:::

## Custom cache

::: warning Probably you should not use custom cache

Browsers are very powerful systems, they are developed by large teams with a great experience. They have a lot of optimizations and tricks to make your application work faster. If you are using custom cache, you are bypassing all of them. This can lead to unexpected behavior and performance issues.

Consider using [browser cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) first, talk to your backend team to make sure that they are using proper cache headers. If you still need custom cache, make sure that you are aware of the consequences.

:::

If browser cache is not enough for your use case, you can use custom cache. Farfetched provides [`cache`](/api/operators/cache) operator that allows you to do it with a simple declarative API.

::: tip TL;DR

Call [`cache`](/api/operators/cache) operator with a [_Query_](/api/primitives/query) that you want to cache and a cache adapter that you want to use as a cache storage.

```ts
import { cache } from '@farfetched/core';

cache(characterQuery);
```

:::

Below, let's take a bit more detailed review of this feature.

## Prerequisites

Every [_Query_](/api/primitives/query) has to have a unique key that is used to identify it. You can set it with `name` field while creating a [_Query_](/api/primitives/query):

```ts
const characterQuery = createQuery({
  name: 'character',
  // ...
});
```

However, it could be annoying to control uniqueness of the names manually, so you can set up code transformation tool to do it for you.

<!--@include: ../shared/sids_plugins.md-->

## Cache adapters

[`cache`](/api/operators/cache) does not specify where to store cached data. It is up to you to choose a cache adapter. Farfetched provides a few adapters out of the box:

- `inMemoryCache` (**default adapter**) is the simplest adapter that stores cached data in memory, so it is not persistent, and you can cache any data without serialization. Cache wipes out when the page is reloaded and could not be shared between tabs.
- `localStorageCache` is an adapter that stores cached data in the `localStorage` of the browser. It is persistent, so you can store only serializable data with this adapter. Cache is shared between tabs and persists after page reloads.
- `sessionStorageCache` is an adapter that stores cached data in the `sessionStorage` of the browser. It is persistent, so you can store only serializable data with this adapter. Cache is not shared between tabs, but stores after page reloads.

::: tip
Use `localStorageCache` only with auto-deletion options, like `maxAge` or `maxEntries`. Otherwise, you can easily run out of space in the `localStorage`.
:::

## Auto-delete cache entries

You can use `maxAge` and `maxEntries` options to automatically delete cache entries. This is useful to avoid running out of space in the `localStorage` or `sessionStorage` or out of memory errors in the `inMemoryCache`. Any adapter can be configured with these options.

### `maxEntries`

It is the maximum number of entries that can be stored in the cache. When the limit is reached, the oldest entry is deleted.

```ts
import { cache, localStorageCache } from '@farfetched/core';

cache(characterQuery, {
  adapter: localStorageCache({ maxEntries: 100 }),
});
```

### `maxAge`

It is the maximum age of the entry in [milliseconds or human-readable format](/api/primitives/time). When the limit is reached, the entry is deleted.

```ts
import { cache, localStorageCache } from '@farfetched/core';

cache(characterQuery, {
  adapter: localStorageCache({ maxAge: '1h30min' }),
});
```

::: tip
Due to browser internal limitations, the `maxAge` option is not precise. It is not guaranteed that the entry will be deleted exactly after the specified time. It can be deleted earlier or later. However, your application will never see outdated entries because [`cache`](/api/operators/cache) operator always checks the age of the entry before returning it.
:::

### Combination

You can combine these options to achieve the desired behavior. For example, you can store data for 1 hour or 100 entries, whichever comes first.

```ts
import { cache, localStorageCache } from '@farfetched/core';

cache(characterQuery, {
  adapter: localStorageCache({ maxAge: '1h30min', maxEntries: 100 }),
});
```

## Purge all data from cache

Sometimes you need to purge all data from cache. For example, when you want to force user to reload all data after logout. Farfetched provides `purge`option of [`cache`](/api/operators/cache) operator for this purpose.

```ts
import { logout } from 'effector';
import { cache } from '@farfetched/core';

const logout = createEvent();

cache(characterQuery, { purge: logout });

document.getElementById('logout').addEventListener('click', () => {
  logout();
});
```

::: tip
`createEvent` is a part of [Effector](https://effector.dev) API that creates [_Event_](https://effector.dev/docs/api/effector/event) that could be called and could be watched. In this example, we are calling `logout` event when user clicks on the logout button.
:::

After calling `purge` [_Event_](https://effector.dev/docs/api/effector/event), all data from cache will be deleted immediately.

## Do not fetch fresh data

By default, Farfetched will fetch fresh data from the server immediately after [_Query_](/api/primitives/query) is started even if data is already found in cache. So, default behavior is to **fetch fresh data every time and provide stale data as soon as possible**.

You can alter this behavior with `staleAfter` option of [`cache`](/api/operators/cache) operator. It accepts a [number of milliseconds or human-readable format](/api/primitives/time) and considers data as fresh if it is not older than the specified time.

```ts
import { cache } from '@farfetched/core';

cache(characterQuery, { staleAfter: '10min' });
```

👆 if data is not older than 10 minutes, it will be considered as fresh and will not be fetched from the server.

## Deep-dive

If you want to learn more about internal implementation of [`cache`](/api/operators/cache) operator, consider reading the [deep-dive article about it](/recipes/cache).
