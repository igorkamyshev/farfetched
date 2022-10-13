## `zodContract`

Creates a [_Contract_](/api/primitives/contract) based on given `ZodType`.

```ts
import { z } from 'zod';
import { zodContract } from '@farfetched/zod';

const Asteroid = z.object({
  type: z.literal('asteroid'),
  mass: z.number(),
});

const asteroidContract = zodContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
