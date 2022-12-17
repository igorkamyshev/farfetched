# Farfetched and Solid

Integration is distributed as a separate package, you have to install it and its peer dependency before usage:

::: code-group

```sh [pnpm]
pnpm install @farfetched/solid effector-solid
```

```sh [yarn]
yarn add @farfetched/solid effector-solid
```

```sh [npm]
npm install @farfetched/solid effector-solid
```

:::

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)

## `createQueryResource`

It is analogue of SoildJS [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), but uses [_Query_](/api/primitives/query) as a source and fetcher.

```tsx
import { createQueryResource } from '@farfetched/solid';

function UserProfile() {
  const [user] = createQueryResource(userQuery);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>User could not be shown</p>}>
        <section>
          <p>{user()?.name}</p>
          <p>{user()?.email}</p>
        </section>
      </ErrorBoundary>
    </Suspense>
  );
}
```

## `useMutation` <Badge type="tip" text="since v0.2.0" />

Returns function to start [_Mutation_](/api/primitives/mutation).

```tsx
import { useMutation } from '@farfetched/solid';

function Login() {
  // ...

  const { start: login, pending: loginPending } = useMutation(loginMutation);

  const handleSubmit = () => {
    login({ email: /*...*/, password: /*...*/ });
  };

  return (
    <Show when={!loginPending()} fallback={<Loading />}>
      <LoginForm /*...*/ onSubmit={handleSubmit} />
    </Show>
  );
}
```
