import { String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

describe('runtypes/runtypeContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = runtypeContract(String);

    expect(contract.error.is(2)).toBeTruthy();

    const error = contract.error.extract(2);
    expect(error).toBe(2);

    expect(contract.data.validate(2)).toMatchInlineSnapshot(`
      Array [
        "Expected string, but was number",
      ]
    `);
    expect(() => contract.data.extract(2)).toThrowErrorMatchingInlineSnapshot(
      `"Expected string, but was number"`
    );
  });

  test('passes valid data', () => {
    const contract = runtypeContract(String);

    expect(contract.data.validate('foo')).toBe(null);

    const data = contract.data.extract('foo');
    expect(data).toBe('foo');

    expect(contract.error.is('bar')).toBeFalsy();
    expect(() =>
      contract.error.extract('bar')
    ).toThrowErrorMatchingInlineSnapshot(
      `"Logic exception! You are trying to extract error from valid response"`
    );
  });
});
