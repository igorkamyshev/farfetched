# useQuery

Subscribes on [_Query_](/api/primitives/query), returns its state and re-render the component when the [_Query_](/api/primitives/query) changes.

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
