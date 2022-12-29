# Farfetched and Runtypes

Integration is distributed as a separate package, you have to install it and its peer dependencies before usage

::: code-group

```sh [pnpm]
pnpm install runtypes @farfetched/runtypes
```

```sh [yarn]
yarn add runtypes @farfetched/runtypes
```

```sh [npm]
npm install runtypes @farfetched/runtypes
```

:::

## Showcases

- [Real-world showcase with SolidJS around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/)
- [Real-world showcase with React around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/react-real-world-pokemons/)
- [Real-world showcase with Forest around JSON API](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/forest-real-world-breaking-bad/)

## `runtypeContract`

Creates a [_Contract_](/api/primitives/contract) based on given `Runtype`.

```ts
import { Record, Literal, Number, Vector } from 'runtypes';
import { runtypeContract } from '@farfetched/runtypes';

const Asteroid = Record({
  type: Literal('asteroid'),
  mass: Number,
});

const asteriodContract = runtypeContract(Asteroid);

/* typeof asteriodContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
