## `runtypeContract`

Creates a [_Contract_](/api/primitives/contract) based on given `Runtype`.

```ts
import { Record, Literal, Number, Vector } from 'runtypes';
import { runtypeContract } from '@farfetched/runtypes';

const Asteroid = Record({
  type: Literal('asteroid'),
  mass: Number,
});

const asteriodContarct = runtypeContract(Asteroid);

/* typeof asteriodContarct === Contarct<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
