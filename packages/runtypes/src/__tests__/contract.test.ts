import { String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

describe('runtypes/runtypeContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = runtypeContract(String);

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      Array [
        "Expected string, but was number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = runtypeContract(String);

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });
});
