# useMutation

::: info
Introduced in v0.2.0.
:::

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
