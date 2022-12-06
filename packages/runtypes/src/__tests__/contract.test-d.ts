import { describe, expectTypeOf } from 'vitest';
import { String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

describe('runtypeContract', () => {
  const contract = runtypeContract(String);

  const smth: unknown = null;

  if (contract.isData(smth)) {
    expectTypeOf(smth).toEqualTypeOf<string>();
    // @ts-expect-error smth is string
    expectTypeOf(smth).toEqualTypeOf<number>();
  }
});
