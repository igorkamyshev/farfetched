# `keepFresh` <Badge type="tip" text="since v0.8.0" />

Refreshes the data in a [_Query_](/api/primitives/query) automatically or on demand.

::: tip Note
`keepFresh` operator refreshes only [_Queries_](/api/primitives/query) that were started at least once. So, consider calling `query.refresh` on the app start.
:::

## Formulae, automatic refresh

Refreshes the data in a [_Query_](/api/primitives/query) automatically if any [_Store_](https://effector.dev/docs/api/effector/store) that is used in the [_Query_](/api/primitives/query) creation is changed.

```ts
import { keepFresh } from '@farfetched/core';

keepFresh(query);
```

## Formulae, explicit triggers

Refreshes the data in a [_Query_](/api/primitives/query) after any of the specified [_Events_](https://effector.dev/docs/api/effector/event) is triggered.

```ts
import { keepFresh } from '@farfetched/core';

keepFresh(query, { triggers: [windowGotFocus] });
```

- `triggers`: _Array_ of [_Events_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query).

:::tip
You can use any object that follows the [`@@trigger`-protocol](https://withease.pages.dev/protocols/trigger.html) as a trigger in the `keepFresh` operator.
:::
