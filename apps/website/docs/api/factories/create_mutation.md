# `createMutation`

::: info
Introduced in v0.2.0.
:::

## Formulae

### `createMutation({ handler })`

Creates [_Mutation_](/api/primitives/mutation) based on given asynchronous function.

```ts
const loginMutation = createMutation({
  handler: async ({ login, password }) => {
    const response = await fetch('https://api.salo.com/login.json', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });

    return response.json();
  },
});
```

### `createMutation({ effect })`

Creates [_Mutation_](/api/primitives/mutation) based on given [_Effect_](https://effector.dev/docs/api/effector/effect).

Usage of [_Effect_](https://effector.dev/docs/api/effector/effect) instead of simple asynchronous function allows you to declare types of possible errors statically that will be passed to [_Mutation_](/api/primitives/mutation).

```ts
const loginMutation = createMutation({
  effect: createEffect<
    { login: string; password: string },
    { email: string },
    LoginError
  >(async ({ login, password }) => {
    const response = await fetch('https://api.salo.com/login.json', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      throw new LoginError();
    }

    return response.json();
  }),
});

// typeof loginMutation.finished.failure === Event<{
//   error: LoginError,
//   params: { login: string, password: string }
// }>
```
