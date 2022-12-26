# `connectQuery`

Creates static connection between [_Queries_](../primitives/query.md). Every time when `source` [_Queries_](../primitives/query.md) successfully done, `target` [_Query_](../primitives/query.md) will start with a data from `source` as parameters.

## Formulae

### `connectQuery({ source, target })`

This form is used for `target` [_Query_](../primitives/query.md) without parameters. It does not pass any data to `target`.

```ts
const languagesQuery: Query<unknown, unknown, unknown>;
const blocksQuery: Query<unknown, unknown, unknown>;

const contentQuery: Query<void, unknown, unknown>;

connectQuery({
  source: { language: languagesQuery, blocks: blocksQuery },
  target: contentQuery,
});
```

### `connectQuery({ source, fn, target })`

This form is used for `target` [_Query_](../primitives/query.md) with parameters. It gets results and parameters of `source`, transforms it through `fn` and uses it for `target` [_Query_](../primitives/query.md).

`fn` accepts an object with the shape from `source`, each field contains `result` and `params` of the corresponding [_Query_](../primitives/query.md) and returns an object with a single field `params` which is used to start `target` [_Query_](../primitives/query.md).

```ts
const blocksQuery: Query<unknown, string, unknown>;
const blocksQuery: Query<unknown, string[], unknown>;

const contentQuery: Query<
  { language: string; ids: string[] },
  unknown,
  unknown
>;

connectQuery({
  source: { language: languagesQuery, blocks: blocksQuery },
  fn({ language, blocks }) {
    // language.params contains parameters of the `languagesQuery`
    // language.result contains result of the `languagesQuery`

    // blocks.params contains parameters of the `blocksQuery`
    // blocks.result contains result of the `blocksQuery`

    return { params: { lang: language.result, ids: blocks.result } };
  },
  target: contentQuery,
});
```

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
- [Real-world showcase with React around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/react-real-world-pokemons/)
