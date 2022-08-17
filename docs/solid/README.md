# `@farfetched/solid`

> It is a separate package `@farfetched/solid`, you have to install it before usage

with `pnpm`

```sh
pnpm install @farfecthed/solid
```

with `yarn`

```sh
yarn add @farfecthed/solid
```

with `npm`

```sh
npm install @farfecthed/solid
```

## Methods

### `createQueryResource(query)`

It is analogue of SoildJS [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), but uses [_Query_](../core/primitives/query.md) as a source and fetcher.

```tsx
function UserProfile() {
  const [user] = createQueryResource(userQuery);

  return (
    <Suspense fallback={<Loader />}>
      <section>
        <p>{user().name}</p>
        <p>{user().email}</p>
      </section>
    </Suspense>
  );
}
```

## Showcases

- [SolidJS + `createQuery`](../../apps/showcase/solid-create-query/)
- [Real-world showcase with SolidJS around JSON API](../../apps/showcase/solid-real-world-rick-morty/)
