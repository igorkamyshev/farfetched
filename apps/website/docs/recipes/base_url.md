# Base URL for all operations

Let us assume that all your API requests are going to the same base URL. For example, you have a backend server running on `https://api.salo.com` and all your API requests are going to this URL with different paths.

It could be a bit tedious to repeat the same base URL for all your API requests. Since [Farfetched has no globals](/statements/no_globals), you have to specify the base URL for each request.

## Solution

However, there is a way to make it easier — URL creator. It is a function that takes a path and returns a full URL. For example:

```ts
function baseUrl(path) {
  return `https://api.salo.com${path}`;
}
```

Now you can use it in your API requests:

```ts
import { createJsonQuery } from '@farfetched/core';

const usersQuery = createJsonQuery({
  request: {
    url: baseUrl('/users'),
    method: 'GET',
  },
  /* ... */
});
```

That is it. You can use the same URL creator for all your API requests.

## Explanation

Explicitness is one of the core principles of Farfetched. In this case it allows you to have a full control over your API requests. You can easily change the base URL for all your API requests by changing the URL creator function. Or you can use different URL creators for different API requests if you need to.

```js
const usersQuery = createJsonQuery({
  request: {
    url: baseUrl('/users'), // [!code --]
    url: otherBaseUrl('/users'), // [!code ++]
    method: 'GET',
  },
  /* ... */
});
```

For more complex cases you can even use a URL creator that returns a [_Store_](https://effector.dev/en/api/effector/store/) with desired URL. Let us assume that you have a [_Store_](https://effector.dev/en/api/effector/store/) with a current language, and you want to use it in your API requests:

```ts
import { combine } from 'effector';

function baseUrl(path) {
  return `https://api.salo.com${path}`; // [!code --]

  /* [!code ++:4] */ return combine(
    $langauge,
    (language) => `https://api.salo.com/${language}${path}`
  );
}
```
