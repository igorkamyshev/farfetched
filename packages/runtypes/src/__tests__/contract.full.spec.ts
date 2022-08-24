import { Number, String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

describe('runtypes/runtypeContract full', () => {
  test('error response', () => {
    const contract = runtypeContract({ data: String, error: Number });

    expect(contract.isError(2)).toBeTruthy();

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      Array [
        "Expected string, but was number",
      ]
    `);
  });

  test('valid data', () => {
    const contract = runtypeContract({ data: String, error: Number });

    expect(contract.getErrorMessages('foo')).toEqual([]);

    expect(contract.isError('bar')).toBeFalsy();
  });

  test('invalid data', () => {
    const Iata = String.withConstraint((s) => s.length === 3).withBrand('Iata');

    const contract = runtypeContract({
      data: Iata,
      error: Number,
    });

    expect(contract.getErrorMessages('HKT')).toEqual([]);
    expect(contract.getErrorMessages('lolkek')).toMatchInlineSnapshot(`
      Array [
        "Failed constraint check for string",
      ]
    `);

    expect(contract.isError('lolkek')).toBeFalsy();
  });
});
