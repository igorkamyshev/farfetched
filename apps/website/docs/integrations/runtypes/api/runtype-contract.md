## `runtypeContract(runtype)`

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
 *   unknown 👈 otherwise it will be still unknown
 * >
 */
```

## `runtypeContract({ data, error })`

Creates a [_Contract_](/api/primitives/contract) based on given data-`Runtype` and error-`Runtype`.

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
 *   unknown, 👈 it accepts something unknown
 *   { data: { value: string }, error: null }, 👈 and validates if it is an SuccessResponse
 *   { data: null, errors: string[] } 👈 otherwise it will be ErrorResponse
 * >
 */
```
