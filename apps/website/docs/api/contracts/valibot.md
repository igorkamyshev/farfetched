# Farfetched and Valibot

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install valibot @farfetched/valibot
```

```sh [yarn]
yarn add valibot @farfetched/valibot
```

```sh [npm]
npm install valibot @farfetched/valibot
```

:::

## `valibotContract`

Creates a [_Contract_](/api/primitives/contract) based on given `BaseSchema`.

```ts
import { object, literal, number } from 'valibot';
import { valibotContract } from '@farfetched/valibot';

const Asteroid = object({
  type: literal('asteroid'),
  mass: number(),
});

const asteroidContract = valibotContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
