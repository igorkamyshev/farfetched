# `@farfetched/react`

> It is a separate package `@farfetched/react`, you have to install it and its peer dependencies before usage

with `pnpm`

```sh
pnpm install @farfecthed/react effector-react
```

with `yarn`

```sh
yarn add @farfecthed/react effector-react
```

with `npm`

```sh
npm install @farfecthed/react effector-react
```

## Methods

### `useQuery(query)`

Subscribes on [_Query_](../primitives/query.md) and re-render the component when the [_Query_](../primitives/query.md) changes.

```tsx
function UserProfile() {
  const { data: user, pending } = useQuery(userQuery);

  if (pending) {
    return <Loader />;
  }

  return (
    <section>
      <p>{user.name}</p>
      <p>{user.email}</p>
    </section>
  );
}
```

## Showcases

- [React + `createQuery`](../../apps/showcase/react-create-query/)
- [React + `createJsonQuery`](../../apps/showcase/react-create-json-query/)
- [React + `connectQuery`](../../apps/showcase/react-connect-query/)
