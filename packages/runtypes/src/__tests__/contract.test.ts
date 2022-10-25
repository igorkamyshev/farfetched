import { Array, Number, Record, String } from 'runtypes';
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

  test('uses readable error for complex data structuire', () => {
    const contract = runtypeContract(Record({ age: Number, name: String }));

    expect(contract.getErrorMessages({ age: 'not a number', name: 11 }))
      .toMatchInlineSnapshot(`
      [
        "age: Expected number, but was string",
        "name: Expected string, but was number",
      ]
    `);
  });

  test('uses readable error for nested data structuire', () => {
    const contract = runtypeContract(
      Record({ user: Record({ age: Number, name: String }) })
    );

    expect(
      contract.getErrorMessages({ user: { age: 'not a number', name: 11 } })
    ).toMatchInlineSnapshot(`
      [
        "user.age: Expected number, but was string",
        "user.name: Expected string, but was number",
      ]
    `);
  });

  test('uses readable error for arrays in data structuire', () => {
    const contract = runtypeContract(
      Record({ users: Array(Record({ age: Number, name: String })) })
    );

    expect(contract.getErrorMessages({ users: [{ age: 'eleven', name: 11 }] }))
      .toMatchInlineSnapshot(`
      [
        "users.0.age: Expected number, but was string",
        "users.0.name: Expected string, but was number",
      ]
    `);

    // ignore correct value
    expect(
      contract.getErrorMessages({
        users: [
          { age: 25, name: 'Igor' },
          { age: 'eleven', name: 11 },
        ],
      })
    ).toMatchInlineSnapshot(`
      [
        "users.1.age: Expected number, but was string",
        "users.1.name: Expected string, but was number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = runtypeContract(String);

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });
});
