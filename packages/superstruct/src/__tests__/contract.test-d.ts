import { describe, expectTypeOf } from 'vitest';
import { string } from 'superstruct';

import { superstructContract } from '../contract';

describe('superstructContract', () => {
  const contract = superstructContract(string());

  const smth: unknown = null;

  if (contract.isData(smth)) {
    expectTypeOf(smth).toEqualTypeOf<string>();
    // @ts-expect-error smth is string
    expectTypeOf(smth).toEqualTypeOf<number>();
  }
});
