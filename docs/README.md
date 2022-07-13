# Documentation

## Tutorial

## Handbook

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

- [`@farfetched/runtypes`](./runtypes/README.md) — bindings between `farfetched` and [`runtypes`](https://github.com/pelotom/runtypes), it allows using `Runtype` as a [_Contract_](./core/primitives/contract.md).
- [`@farfetched/react`](./react/README.md) — bindings between `farfetched` and [React](https://reactjs.org), it allows rendering components based on data from the [_Query_](./core/primitives/query.md).

## Showcases

- [React + `createQuery`](../apps/showcase/react-create-query/)
- [React + `createJsonQuery`](../apps/showcase/react-create-json-query/)
