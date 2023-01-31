# Farfetched and superstruct

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install superstruct @farfetched/superstruct
```

```sh [yarn]
yarn add superstruct @farfetched/superstruct
```

```sh [npm]
npm install superstruct @farfetched/superstruct
```

:::

## `superstructContract`

Creates a [_Contract_](/api/primitives/contract) based on given `Struct`.

```ts
import * as s from 'superstruct';
import { superstructContract } from '@farfetched/superstruct';

const Asteroid = s.type({
  type: s.literal('asteroid'),
  mass: s.number(),
});

const asteroidContract = superstructContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
