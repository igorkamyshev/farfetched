# Suspense with Solid

Farfetched has a [Solid integration](/api/ui/solid) with Suspense support, just install `@farfetched/solid`.

::: code-group

```sh [pnpm]
pnpm install @farfetched/solid
```

```sh [yarn]
yarn add @farfetched/solid
```

```sh [npm]
npm install @farfetched/solid
```

:::

And use `createQueryResource` to create a resource for your [_Query_](/api/primitives/query):

```tsx
import { createQueryResource } from '@farfetched/solid';

function UserProfile() {
  const [user] = createQueryResource(userQuery);

  return (
    <Suspense fallback={<Loading />}>
      <section>
        <p>{user().name}</p>
        <p>{user().email}</p>
      </section>
    </Suspense>
  );
}
```
