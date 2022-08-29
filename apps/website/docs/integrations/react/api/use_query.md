# useQuery

Subscribes on [Query](/api/primitives/query), returns its state and re-render the component when the [Query](/api/primitives/query) changes.

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
