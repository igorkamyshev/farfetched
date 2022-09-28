# useMutation

Returns function to start [_Mutation_](/api/primitives/mutation).

```tsx
function UserProfile() {
  // ...
  const { start: login } = useMutation(loginMutation);

  const handleSubmit = () => {
    login({ email, password });
  };

  // ...
}
```
