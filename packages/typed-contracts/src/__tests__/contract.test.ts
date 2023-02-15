import { string, object, number, array } from 'typed-contracts';
import { describe, test, expect } from 'vitest';

import { typedContract } from '../contract';

describe('ioTsContract', () => {
  test('interprets invalid response as error', () => {
    const contract = typedContract(string);

    const data = 2;

    expect(contract.isData(data)).toBe(false);

    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "\`value\` must be string, but 2 (number) given",
      ]
    `);
  });

  test('uses readable error for complex data structuire', () => {
    const contract = typedContract(object({ age: number, name: string }));

    const data = { age: 'not a number', name: 11 };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "\`value.age\` must be number, but \\"not a number\\" (string) given",
        "\`value.name\` must be string, but 11 (number) given",
      ]
    `);
  });

  test('uses readable error for nested data structuire', () => {
    const contract = typedContract(
      object({ user: object({ age: number, name: string }) })
    );

    const data = { user: { age: 'not a number', name: 11 } };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "\`value.user.age\` must be number, but \\"not a number\\" (string) given",
        "\`value.user.name\` must be string, but 11 (number) given",
      ]
    `);
  });

  test('uses readable error for arrays in data structuire', () => {
    const contract = typedContract(
      object({ users: array(object({ age: number, name: string })) })
    );

    const data = {
      users: [
        // ignore correct value
        { age: 25, name: 'Igor' },
        { age: 'eleven', name: 11 },
      ],
    };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "\`value.users[1].age\` must be number, but \\"eleven\\" (string) given",
        "\`value.users[1].name\` must be string, but 11 (number) given",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = typedContract(string);

    const data = 'foo';

    expect(contract.isData(data)).toBe(true);
    expect(contract.getErrorMessages(data)).toEqual([]);
  });
});
