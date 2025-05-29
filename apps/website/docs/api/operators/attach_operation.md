---
outline: [2, 3]
---

# `attachOperation` <Badge type="tip" text="since v0.6" />

::: danger

This operator is deprecated since [v0.12](/releases/0-12) and will be removed in v0.14. Please read [this ADR](/adr/attach_operation_deprecation) for more information and migration guide.
:::

Creates new [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) on top of the existing one.

::: tip
It is analog of [attach](https://effector.dev/en/api/effector/attach/) from Effector for [_Queries_](/api/primitives/query) or [_Mutations_](/api/primitives/mutation).
:::

## Formulae

### `attachOperation(query)`

Creates new [_Query_](/api/primitives/query) on top of the existing one.

```ts
import { attachOperation, createQuery } from '@farfetched/core';

const originalQuery = createQuery({ handler: async () => 'some data' });
const attachedQuery = attachOperation(originalQuery);
```

### `attachOperation(query, { mapParams })`

Creates new [_Query_](/api/primitives/query) on top of the existing one, transforming its parameters through `mapParams` function.

```ts
import { attachOperation, createQuery } from '@farfetched/core';

const originalQuery = createQuery({
  handler: async (params: string) => 'some data',
});

const attachedQuery = attachOperation(originalQuery, {
  mapParams: (params: number) => params.toString(),
});
```

### `attachOperation(query, { source, mapParams })`

Creates new [_Query_](/api/primitives/query) on top of the existing one, transforming its parameters through `mapParams` function with accept a value from `source` [_Store_](https://effector.dev/en/api/effector/store/) as a second argument.

```ts
import { createStore } from 'effector';
import { attachOperation, createQuery } from '@farfetched/core';

const $externalStore = createStore(12);

const originalQuery = createQuery({
  handler: async (params: string) => 'some data',
});

const attachedQuery = attachOperation(originalQuery, {
  source: $externalStore,
  mapParams: (params: number, externalSource) => (params + externalSource).toString(),
});
```

### `attachOperation(mutation)`

Creates new [_Mutation_](/api/primitives/mutation) on top of the existing one.

```ts
import { attachOperation, createMutation } from '@farfetched/core';

const originalMutation = createMutation({ handler: async () => 'some data' });
const attachedMutation = attachOperation(originalMutation);
```

### `attachOperation(mutation, { mapParams })`

Creates new [_Mutation_](/api/primitives/mutation) on top of the existing one, transforming its parameters through `mapParams` function.

```ts
import { attachOperation, createMutation } from '@farfetched/core';

const originaMutation = createMutation({
  handler: async (params: string) => 'some data',
});

const attachedMutation = attachOperation(originaMutation, {
  mapParams: (params: number) => params.toString(),
});
```

### `attachOperation(mutation, { source, mapParams })`

Creates new [_Mutation_](/api/primitives/mutation) on top of the existing one, transforming its parameters through `mapParams` function with accept a value from `source` [_Store_](https://effector.dev/en/api/effector/store/) as a second argument.

```ts
import { createStore } from 'effector';
import { attachOperation, createMutation } from '@farfetched/core';

const $externalStore = createStore(12);

const originalMutation = createMutation({
  handler: async (params: string) => 'some data',
});

const attachedMutation = attachOperation(originalMutation, {
  source: $externalStore,
  mapParams: (params: number, externalSource) => (params + externalSource).toString(),
});
```

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase-solid-real-world-rick-morty/)
