# `keepFresh` <Badge type="tip" text="since v0.8.0" />

Refreshes the data in a [_Query_](/api/primitives/query) automatically or on demand.

::: tip Note
`keepFresh` operator refreshes only [_Queries_](/api/primitives/query) that were started at least once. So, consider calling `query.refresh` on the app start.
:::

## Formulae

### `keepFresh(query, config)`

Config fields:

- `automatically?`: _true_ to refresh the data in a [_Query_](/api/primitives/query) automatically if any [_Store_](https://effector.dev/docs/api/effector/store) that is used in the [_Query_](/api/primitives/query) creation is changed.
- `triggers?`: _Array_ of [_Events_](https://effector.dev/docs/api/effector/event) after which operator starts refreshing the data in the [_Query_](/api/primitives/query).
- `enabled?`: <Badge type="tip" text="since v0.11" /> [_Store_](https://effector.dev/docs/api/effector/store) with the current enabled state. Disabled _keepFresh_ will not execute queries, instead, they will be treated as skipped. Can be `true` or `false`.

```ts
import { keepFresh } from '@farfetched/core';

keepFresh(query, { automatically: true, triggers: [someExternalEvent] });
```

:::tip
You can use any object that follows the [`@@trigger`-protocol](https://withease.pages.dev/protocols/trigger.html) as a trigger in the `keepFresh` operator's field `triggers`.
:::
