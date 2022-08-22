# `connectQuery`

Creates static connection between [_Queries_](../primitives/query.md). Every time when `source` [_Queries_](../primitives/query.md) successfully done, `target` [_Query_](../primitives/query.md) will start with a data from `source` as parameters.

## Formulae

### `connectQuery({ source, target })`

This form is used for `target` [_Query_](../primitives/query.md) without parameters. It does not pass any data to `target`.

```ts
const languagesQuery: Query<unkown, unkown, unkown>;
const blocksQuery: Query<unkown, unkown, unkown>;

const contentQuery: Query<void, unkown, unkown>;

connectQuery({
  source: { language: languagesQuery, blocks: blocksQuery },
  target: contentQuery,
});
```

### `connectQuery({ source, fn, target })`

This form is used for `target` [_Query_](../primitives/query.md) with parameters. It gets data from `source`, transforms it through `fn` and uses it for `target` [_Query_](../primitives/query.md), allowed fields:

- `params` — data that is used to start `target` [_Query_](../primitives/query.md)

```ts
const blocksQuery: Query<unkown, string, unkown>;
const blocksQuery: Query<unkown, string[], unkown>;

const contentQuery: Query<{ language: string; ids: string[] }, unkown, unkown>;

connectQuery({
  source: { language: languagesQuery, blocks: blocksQuery },
  fn({ language, blocks }) {
    return { params: { language, ids: blocks } };
  },
  target: contentQuery,
});
```

## Showcases

- [React + `connectQuery`](../../../apps/showcase/react-connect-query/)
- [Real-world showcase with SolidJS around JSON API](../../../apps/showcase/solid-real-world-rick-morty/)
