# Documentation

## Tutorial

Stay tuned...

## Handbook

### Primitives

- [_Query_](./core/primitives/query.md)
- [_Contract_](./core/primitives/contract.md)

### Factories

- [`createQuery`](./core/factories/create_query.md) — a basic factory to create a [_Query_](./core/primitives/query.md) based on function or [_Effect_](https://effector.dev/docs/api/effector/effect).
- [`createJsonQuery`](./core/factories/create_json_query.md) — creates a [_Query_](./core/primitives/query.md) based on declarative config for any JSON API.

#### Common config

Any factory in any overload accepts these fields in top level of config.

- `enabled` — you can disable [_Query_](./core/primitives/query.md) by passing `false` or [_Store_](https://effector.dev/docs/api/effector/store) with `false`
- `name` — it is used to distinguish [_Query_](./core/primitives/query.md) while debugging.

### Operators

- [`connectQuery`](./core/operators/connect_query.md) — connects child [_Query_](./core/primitives/query.md) to its parents, child starts execution after all parents successful end with data from them.

### Statements

- [Releases policy](./handbook/releases.md)
- [Do not trust remote data](./handbook/never_trust.md)
- [Effector](./handbook/effector.md)
- [Render as you fetch](./handbook/render_as_you_fetch.md)

### How to

- [How to deal with errors](./how_to/errors.md)
- [Unit tests](./how_to/testing.md)
- [Server side rendering (SSR)](./how_to/ssr.md)
- [How not to use Fetch API](./how_to/no_fetch.md)
- [Custom _Query_ creation](./how_to/custom_query.md)

### Integrations

- [`@farfetched/runtypes`](./runtypes/README.md) — bindings for [Runtypes](https://github.com/pelotom/runtypes), it allows using `Runtype` as a [_Contract_](./core/primitives/contract.md).
- [`@farfetched/react`](./react/README.md) — bindings for [React](https://reactjs.org), it allows rendering components based on data from the [_Query_](./core/primitives/query.md).
- [`@farfetched/solid`](./solid/README.md) — bindings for [SolidJS](https://www.solidjs.com), it allows using [_Query_](./core/primitives/query.md) as regular resource.

## Showcases

- [React + `createQuery`](../apps/showcase/react-create-query/)
- [React + `createJsonQuery`](../apps/showcase/react-create-json-query/)
- [SolidJS + `createQuery`](../apps/showcase/solid-create-query/)
- [React + `connectQuery`](../apps/showcase/react-connect-query/)
- [Real-world showcase with SolidJS around JSON API](../apps/showcase/solid-real-world-rick-morty/)
