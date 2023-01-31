import * as t from 'io-ts';
import { describe, test, expect } from 'vitest';

import { ioTsContract } from '../contract';

describe('ioTsContract', () => {
  test('interprets invalid response as error', () => {
    const contract = ioTsContract(t.string);

    const data = 2;

    expect(contract.isData(data)).toBe(false);

    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "Invalid value 2 supplied to : string",
      ]
    `);
  });

  test('uses readable error for complex data structuire', () => {
    const contract = ioTsContract(t.type({ age: t.number, name: t.string }));

    const data = { age: 'not a number', name: 11 };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "Invalid value \\"not a number\\" supplied to : { age: number, name: string }/age: number",
        "Invalid value 11 supplied to : { age: number, name: string }/name: string",
      ]
    `);
  });

  test('uses readable error for nested data structuire', () => {
    const contract = ioTsContract(
      t.type({ user: t.type({ age: t.number, name: t.string }) })
    );

    const data = { user: { age: 'not a number', name: 11 } };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "Invalid value \\"not a number\\" supplied to : { user: { age: number, name: string } }/user: { age: number, name: string }/age: number",
        "Invalid value 11 supplied to : { user: { age: number, name: string } }/user: { age: number, name: string }/name: string",
      ]
    `);
  });

  test('uses readable error for arrays in data structuire', () => {
    const contract = ioTsContract(
      t.type({ users: t.array(t.type({ age: t.number, name: t.string })) })
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
        "Invalid value \\"eleven\\" supplied to : { users: Array<{ age: number, name: string }> }/users: Array<{ age: number, name: string }>/1: { age: number, name: string }/age: number",
        "Invalid value 11 supplied to : { users: Array<{ age: number, name: string }> }/users: Array<{ age: number, name: string }>/1: { age: number, name: string }/name: string",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = ioTsContract(t.string);

    const data = 'foo';

    expect(contract.isData(data)).toBe(true);
    expect(contract.getErrorMessages(data)).toEqual([]);
  });
});
