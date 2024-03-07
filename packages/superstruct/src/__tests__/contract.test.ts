import * as s from 'superstruct';
import { describe, test, expect } from 'vitest';

import { superstructContract } from '../contract';

describe('ioTsContract', () => {
  test('interprets invalid response as error', () => {
    const contract = superstructContract(s.string());

    const data = 2;

    expect(contract.isData(data)).toBe(false);

    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "Expected a string, but received: 2",
      ]
    `);
  });

  test('uses readable error for complex data structuire', () => {
    const contract = superstructContract(
      s.type({ age: s.number(), name: s.string() })
    );

    const data = { age: 'not a number', name: 11 };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "age: Expected a number, but received: "not a number"",
        "name: Expected a string, but received: 11",
      ]
    `);
  });

  test('uses readable error for nested data structuire', () => {
    const contract = superstructContract(
      s.type({ user: s.type({ age: s.number(), name: s.string() }) })
    );

    const data = { user: { age: 'not a number', name: 11 } };

    expect(contract.isData(data)).toBe(false);
    expect(contract.getErrorMessages(data)).toMatchInlineSnapshot(`
      [
        "user.age: Expected a number, but received: "not a number"",
        "user.name: Expected a string, but received: 11",
      ]
    `);
  });

  test('uses readable error for arrays in data structuire', () => {
    const contract = superstructContract(
      s.type({ users: s.array(s.type({ age: s.number(), name: s.string() })) })
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
        "users.1.age: Expected a number, but received: "eleven"",
        "users.1.name: Expected a string, but received: 11",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = superstructContract(s.string());

    const data = 'foo';

    expect(contract.isData(data)).toBe(true);
    expect(contract.getErrorMessages(data)).toEqual([]);
  });
});
