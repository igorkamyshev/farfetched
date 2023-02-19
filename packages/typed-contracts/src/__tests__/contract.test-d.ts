import { describe, expectTypeOf } from 'vitest';
import { string } from 'typed-contracts';

import { typedContract } from '../contract';

describe('runtypeContract', () => {
  const contract = typedContract(string);

  const smth: unknown = null;

  if (contract.isData(smth)) {
    expectTypeOf(smth).toEqualTypeOf<string>();
    // @ts-expect-error smth is string
    expectTypeOf(smth).toEqualTypeOf<number>();
  }
});
