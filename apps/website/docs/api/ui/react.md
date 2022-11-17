# Farfetched and React

Integration is distributed as a separate package, you have to install it and its peer dependency before usage:

with `pnpm`

```sh
pnpm install @farfetched/react effector-react
```

with `yarn`

```sh
yarn add @farfetched/react effector-react
```

with `npm`

```sh
npm install @farfetched/react effector-react
```

## Showcases

- [Real-world showcase with React around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/react-real-world-pokemons/)

## Suspense in React integration

::: tip TL;DR

Suspense for Data Fetching is unsupported in `@farfetched/react`, because it is [still unstable](https://github.com/facebook/react/issues/13206), and we do not want to force you to use APIs that are not ready.

:::

Current state of Suspense for Data Fetching is pretty unclear, there are no official documentation, and all that we know is it will be releases [likely after React 18](https://github.com/reactwg/react-18/discussions/47#discussioncomment-847004). We are following any news about this feature and will add support for it as soon as it will be ready.

If you want to use Farfetched with Suspense, consider using [Solid](https://www.solidjs.com), that is a declarative JavaScript library for creating user interfaces. It is very similar to React, but it has numerous advantages over React, and it is much more performant. Furthermore, it is straightforward to migrate from React to Solid, and it is possible to use Solid and React in the same project. Farfetched has a [Solid integration](/api/ui/solid) with Suspense support.

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
