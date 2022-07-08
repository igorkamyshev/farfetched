# `@farfetched/runtypes`

### Formulae

#### `runtypeContract(runtype)`

Creates a [_Contract_](./core/primitives/contract.md) based on given `Runtype`.

```ts
import { Record, Literal, Number, Vector } from 'runtypes';
import { runtypeContract } from '@farfetched/runtypes';

const Asteroid = Record({
  type: Literal('asteroid'),
  mass: Number,
});

const asteriodContarct = runtypeContract(Asteroid);

/* typeof asteriodContarct === Contarct<
 *   unkown, 👈 it accepts something unkown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 *   unkown 👈 otherwise it will be still unkown
 * >
 */
```

#### `runtypeContract({ data, error })`

Creates a [_Contract_](./core/primitives/contract.md) based on given data-`Runtype` and error-`Runtype`.

```ts
import { Record, Null, Array, String } from 'runtypes';
import { runtypeContract } from '@farfetched/runtypes';

const SuccessResponse = Record({
  data: Record({ value: String }),
  errors: Null,
});

const ErrorResponse = Record({
  data: Null,
  errors: Array(String),
});

const asteriodContarct = runtypeContract({
  data: SuccessResponse,
  error: ErrorResponse,
});

/* typeof asteriodContarct === Contarct<
 *   unkown, 👈 it accepts something unkown
 *   { data: { value: string }, error: null }, 👈 and validates if it is an SuccessResponse
 *   { data: null, errors: string[] } 👈 otherwise it will be ErrorResponse
 * >
 */
```
