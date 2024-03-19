# Farfetched and Solid

To use Farfetched with Solid, you need to install Solid-bindings Effector:

::: code-group

```sh [pnpm]
pnpm install effector-solid
```

```sh [yarn]
yarn add effector-solid
```

```sh [npm]
npm install effector-solid
```

:::

::: tip
Farfetched uses [Effector under the hood to handle reactive states and its relations](/statements/effector). It is the reason, why you can reuse Effector's binding for Solid to work with Farfetched.
:::

## `useUnit(query)`

To subscribe on [_Query_](/api/primitives/query) and get its state, you can use `useUnit` from `effector-solid`:

```tsx
import { useUnit } from 'effector-solid';

function UserProfile() {
  const { data: user, pending } = useUnit(userQuery);

  return (
    <>
      <Show when={pending()}>
        <Loader />
      </Show>
      <Show when={!pending()}>
        <section>
          <p>{user().name}</p>
          <p>{user().email}</p>
          //...
        </section>
      </Show>
    </>
  );
}
```

## `useUnit(mutation)`

To start [_Mutation_](/api/primitives/mutation), you can use `useUnit` from `effector-solid` as well:

```tsx
import { useUnit } from 'effector-solid';

function UserProfile() {
  const { start: deleteAccount, pending: deletionInProgress } = useUnit(deleteAccountMutation);

  return (
    <section>
      //...
      <button disabled={deletionInProgress()} onClick={deleteAccount}>
        Delete my account
      </button>
    </section>
  );
}
```
