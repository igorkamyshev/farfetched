# createQueryResource

It is analogue of SoildJS [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), but uses [_Query_](/api/primitives/query) as a source and fetcher.

```tsx
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
