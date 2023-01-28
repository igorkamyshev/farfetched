# Farfetched and io-ts

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install io-ts fp-ts @farfetched/io-ts
```

```sh [yarn]
yarn add io-ts fp-ts @farfetched/io-ts
```

```sh [npm]
npm install io-ts fp-ts @farfetched/io-ts
```

:::

## `ioTsContract`

Creates a [_Contract_](/api/primitives/contract) based on given `Type`.

```ts
import * as t from 'io-ts';
import { ioTsContract } from '@farfetched/io-ts';

const Asteroid = t.type({
  type: t.literal('asteroid'),
  mass: t.number,
});

const asteriodContract = ioTsContract(Asteroid);

/* typeof asteriodContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
