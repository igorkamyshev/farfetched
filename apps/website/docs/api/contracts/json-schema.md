# Farfetched and JSON Schema

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install @farfetched/json-schema
```

```sh [yarn]
yarn add @farfetched/json-schema
```

```sh [npm]
npm install @farfetched/json-schema
```

:::

## `jsonSchemaContract`

Creates a [_Contract_](/api/primitives/contract) based on provided JSON Schema.

```ts
import { jsonSchemaContract } from '@farfetched/json-schema';

const contract = jsonSchemaContract({
  type: 'object',
  additionalProperties: false,
  required: ['type', 'mass'],
  properties: {
    type: { type: 'string', enum: ['asteroid'] },
    mass: { type: 'number' },
  },
});

/* typeof contract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
