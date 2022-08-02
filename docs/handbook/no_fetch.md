# How not to use Fetch API in Farfetched

Since Fetch API is [supported in any modern browser and current version of Node.js](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) Farfetched uses it to make HTTP calls. It adds zero overhead to client bundle and pretty fast on server side. However, in some cases you may want to switch to XMLHttpRequest or some wrappers about it (e.g. [axios](https://axios-http.com)). Let us see how it can be done.

You can use [`createQuery`-factory](../core/factories/create_query.md) and passes your handler to it 👇

```ts
import { createQuery } from '@farfetched/core';
import asxios from 'axios';

const someAxiosQuery = createQuery({
  handler: () => axios.get('/users').then((res) => res.data),
});
```

That is it, `someAxiosQuery` is a regular [_Query_](../core/primitives/query.md) that can be used in any function from Farfetched. Of course, you can use any other library to make HTTP calls the same way.
