# Documentation

## Tutorial

## Handbook

### Primitives

- [_Query_](./core/primitives/query.md)
- [_Contract_](./core/primitives/contract.md)

### Factories

- [`createQuery`](./core/factories/create_query.md) — a basic factory to create a [_Query_](./core/primitives/query.md) based on function or [_Effect_](https://effector.dev/docs/api/effector/effect).

### Operators

- [`connectQuery`](./core/operators/connect_query.md) — connects child [_Query_](./core/primitives/query.md) to its parents, child starts execution after all parents successful end with data from them.

### Integrations

- [`@farfetched/runtypes`](./runtypes/README.md) — bindings between `farfetched` and [`runtypes`](https://github.com/pelotom/runtypes), it allows using `Runtype` as a [_Contract_](./core/primitives/contract.md).

## Showcases

- [React + `createQuery`](../apps/showcase/react-create-query/)
