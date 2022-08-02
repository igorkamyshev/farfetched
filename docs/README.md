# Documentation

## Tutorial

## Handbook

- [How not to use Fetch API in Farfetched](./handbook/no_fetch.md)

### Primitives

- [_Query_](./core/primitives/query.md)
- [_Contract_](./core/primitives/contract.md)

### Factories

- [`createQuery`](./core/factories/create_query.md) — a basic factory to create a [_Query_](./core/primitives/query.md) based on function or [_Effect_](https://effector.dev/docs/api/effector/effect).
- [`createJsonQuery`](./core/factories/create_json_query.md) — creates a [_Query_](./core/primitives/query.md) based on declarative config for any JSON API.

> Note. All factories accept `enabled` field on top level of config. You can disable query by passing `false` or [_Store_](https://effector.dev/docs/api/effector/store) with `false`.

### Operators

- [`connectQuery`](./core/operators/connect_query.md) — connects child [_Query_](./core/primitives/query.md) to its parents, child starts execution after all parents successful end with data from them.

### Integrations

- [`@farfetched/runtypes`](./runtypes/README.md) — bindings for [Runtypes](https://github.com/pelotom/runtypes), it allows using `Runtype` as a [_Contract_](./core/primitives/contract.md).
- [`@farfetched/react`](./react/README.md) — bindings for [React](https://reactjs.org), it allows rendering components based on data from the [_Query_](./core/primitives/query.md).
- [`@farfetched/solid`](./solid/README.md) — bindings for [SolidJS](https://www.solidjs.com), it allows using [_Query_](./core/primitives/query.md) as regular resource.

## Showcases

- [React + `createQuery`](../apps/showcase/react-create-query/)
- [React + `createJsonQuery`](../apps/showcase/react-create-json-query/)
- [SolidJS + `createQuery`](../apps/showcase/solid-create-query/)
