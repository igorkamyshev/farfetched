import { describe, expectTypeOf } from 'vitest';
import * as t from 'io-ts';

import { ioTsContract } from '../contract';

describe('ioTsContract', () => {
  const contract = ioTsContract(t.string);

  const smth: unknown = null;

  if (contract.isData(smth)) {
    expectTypeOf(smth).toEqualTypeOf<string>();
    // @ts-expect-error smth is string
    expectTypeOf(smth).toEqualTypeOf<number>();
  }
});
