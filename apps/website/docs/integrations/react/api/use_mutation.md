# useMutation

Returns function to start [_Mutation_](/api/primitives/mutation).

```tsx
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
