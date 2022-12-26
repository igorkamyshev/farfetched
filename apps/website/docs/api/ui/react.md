# Farfetched and React

::: warning Deprecation notice
Deprecated since v0.5, just use `useUnit` from `effector-react` instead of `useQuery` and `useMutation` 🪄
:::

Integration is distributed as a separate package, you have to install it and its peer dependency before usage:

::: code-group

```sh [pnpm]
pnpm install @farfetched/react effector-react
```

```sh [yarn]
yarn add @farfetched/react effector-react
```

```sh [npm]
npm install @farfetched/react effector-react
```

:::

## Showcases

- [Real-world showcase with React around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/react-real-world-pokemons/)

## `useQuery`

Subscribes on [_Query_](/api/primitives/query), returns its state and re-render the component when the [_Query_](/api/primitives/query) changes.

```tsx
import { useQuery } from '@farfetched/react';

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

## useMutation <Badge type="tip" text="since v0.2.0" />

Returns function to start [_Mutation_](/api/primitives/mutation).

```tsx
import { useMutation } from '@farfetched/react';

function Login() {
  const loginState = useLoginState();

  const { start: login, pending: loginPending } = useMutation(loginMutation);

  const handleSubmit = () => {
    login({ email: loginState.email, password: loginState.password });
  };

  if (loginPending) {
    return <Loading />;
  }

  return <LofinForm {...loginState} onSubmit={handleSubmit} />;
}
```
