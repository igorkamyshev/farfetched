# Farfetched and Zod

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

with `pnpm`

```sh
pnpm install zod @farfetched/zod
```

with `yarn`

```sh
yarn add zod @farfetched/zod
```

with `npm`

```sh
npm install zod @farfetched/zod
```

## `zodContract`

Creates a [_Contract_](/api/primitives/contract) based on given `ZodType`.

```ts
import { z as zod } from 'zod';
import { zodContract } from '@farfetched/zod';

const Asteroid = zod.object({
  type: zod.literal('asteroid'),
  mass: zod.number(),
});

const asteroidContract = zodContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
