# Custom Query creation

[_Query_](/api/primitives/query.md) is a simple object with that stores some reactive primitives — [_Event_](https://effector.dev/docs/api/effector/event), [_Effect_](https://effector.dev/docs/api/effector/effect), and [_Store_](https://effector.dev/docs/api/effector/store). It means you can create Query not only by built-in factories but by your own. E.g. 👇

```ts
function createAsyncStorageQuery({ storageKey }) {
  const $data = createStore(null);
  const $error = createStore(null);

  const start = createEvent();

  const fetchFx = createEffect(() => asyncLocalStorage.getItem(storageKey));

  sample({ clock: start, target: fetchFx });
  sample({ clock: fetchFx.doneData, target: $data });
  sample({ clock: fetchFx.failData, target: $error });

  return { start, $data, $error, ... };
}
```

> In this example, some [Effector](https://effector.dev) APIs were used to create [_Query_](/api/primitives/query) — `createEvent`, `createEffect`, `createStore`, `sample`.

Of course, it looks pretty hard, so Farfetched provides a special helper that aims to simplify creation of custom [_Query_](/api/primitives/query) factories — `createHeadlessQuery`. Let us rewrite provided example with this helper 👇

```ts
function createAsyncStorageQuery({ storageKey }) {
  const fetchFx = createEffect(() => asyncLocalStorage.getItem(storageKey));

  const headlessQuery = createHeadlessQuery(/*...*/);
  headlessQuery.__.executeFx.use(fetchFx);

  return headlessQuery;
}
```

`createHeadlessQuery` hides all logic to handle contracts and errors inside, so you only have to provide executor, which will be called to retrieve new data.
