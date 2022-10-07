import { String } from 'runtypes';
import { describe, test, expect } from 'vitest';

import { runtypeContract } from '../runtype_contract';

describe('runtypes/runtypeContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = runtypeContract(String);

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      [
        "Expected string, but was number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = runtypeContract(String);

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });
});
