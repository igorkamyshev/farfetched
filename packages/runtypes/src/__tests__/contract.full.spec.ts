import { Number, String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

describe('runtypes/runtypeContract full', () => {
  test('error response', () => {
    const contract = runtypeContract({ data: String, error: Number });

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

  test('valid data', () => {
    const contract = runtypeContract({ data: String, error: Number });

    expect(contract.data.validate('foo')).toBe(null);

    const data = contract.data.extract('foo');
    expect(data).toBe('foo');

    expect(contract.error.is('bar')).toBeFalsy();
    expect(() =>
      contract.error.extract('bar')
    ).toThrowErrorMatchingInlineSnapshot(`"Expected number, but was string"`);
  });

  test('invalid data', () => {
    const Iata = String.withConstraint((s) => s.length === 3).withBrand('Iata');

    const contract = runtypeContract({
      data: Iata,
      error: Number,
    });

    expect(contract.data.validate('HKT')).toBe(null);
    expect(contract.data.validate('lolkek')).toMatchInlineSnapshot(`
      Array [
        "Failed constraint check for string",
      ]
    `);

    const data = contract.data.extract('HKT');
    expect(data).toBe('HKT');

    expect(() =>
      contract.data.extract('lolkek')
    ).toThrowErrorMatchingInlineSnapshot(
      `"Failed constraint check for string"`
    );

    expect(contract.error.is('lolkek')).toBeFalsy();
    expect(() =>
      contract.error.extract('lolkek')
    ).toThrowErrorMatchingInlineSnapshot(`"Expected number, but was string"`);
  });
});
