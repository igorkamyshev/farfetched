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
