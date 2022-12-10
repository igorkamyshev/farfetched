import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../type';

describe('contract', () => {
  test('narrows type', () => {
    const contract: Contract<unknown, string> = {} as any;

    const value = {};

    if (contract.isData(value)) {
      expectTypeOf(value).toBeString();
    }
  });
});
