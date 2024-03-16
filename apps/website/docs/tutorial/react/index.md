# Farfetched and React

To use Farfetched with React, you need to install React-bindings Effector:

::: code-group

```sh [pnpm]
pnpm install effector-react
```

```sh [yarn]
yarn add effector-react
```

```sh [npm]
npm install effector-react
```

:::

::: tip
Farfetched uses [Effector under the hood to handle reactive states and its relations](/statements/effector). It is the reason, why you can reuse Effector's binding for React to work with Farfetched.
:::

## `useUnit(query)`

To subscribe on [_Query_](/api/primitives/query) and get its state, you can use `useUnit` from `effector-react`:

```tsx
import { useUnit } from 'effector-react';

function UserProfile() {
  const { data: user, pending } = useUnit(userQuery);

  if (pending) {
    return <Loader />;
  }

  return (
    <section>
      <p>{user.name}</p>
      <p>{user.email}</p>
      //...
    </section>
  );
}
```

## `useUnit(mutation)`

To start [_Mutation_](/api/primitives/mutation), you can use `useUnit` from `effector-react` as well:

```tsx
import { useUnit } from 'effector-react';

function UserProfile() {
  const { start: deleteAccount, pending: deletionInProgress } = useUnit(deleteAccountMutation);

  return (
    <section>
      //...
      <button disabled={deletionInProgress} onClick={deleteAccount}>
        Delete my account
      </button>
    </section>
  );
}
```
