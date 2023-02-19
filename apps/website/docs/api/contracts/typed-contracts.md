# Farfetched and typed-contracts

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install typed-contracts @farfetched/typed-contracts
```

```sh [yarn]
yarn add typed-contracts @farfetched/typed-contracts
```

```sh [npm]
npm install typed-contracts @farfetched/typed-contracts
```

:::

## `typedContract`

Creates a [_Contract_](/api/primitives/contract) based on given `Contract` from `typed-contracts`.

```ts
import { literal, object, number } from 'typed-contracts';
import { typedContract } from '@farfetched/typed-contracts';

const Asteroid = object({
  type: literal('asteroid'),
  mass: number,
});

const asteroidContract = typedContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
