import * as v from 'valibot';
import { describe, test, expect } from 'vitest';

import { valibotContract } from '../valibot_contract';

describe('valibot/valibotContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = valibotContract(v.string());

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      [
        "Invalid type: Expected string but received 2",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = valibotContract(v.string());

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });

  test('isData passes for valid data', () => {
    const contract = valibotContract(
      v.object({
        x: v.number(),
        y: v.string(),
      })
    );

    expect(
      contract.isData({
        x: 42,
        y: 'answer',
      })
    ).toEqual(true);
  });

  test('isData does not pass for invalid data', () => {
    const contract = valibotContract(
      v.object({
        x: v.number(),
        y: v.string(),
      })
    );

    expect(
      contract.isData({
        42: 'x',
        answer: 'y',
      })
    ).toEqual(false);
  });

  test('interprets complex invalid response as error', () => {
    const contract = valibotContract(
      v.tuple([
        v.object({
          x: v.number(),
          y: v.literal(true),
          k: v.set(v.string(), [
            v.minSize(1, 'Invalid set, expected set of strings'),
          ]),
        }),
        v.literal('Uhm?'),
        v.literal(42),
      ])
    );

    expect(
      contract.getErrorMessages([
        {
          x: 456,
          y: false,
          k: new Set(),
        },
        'Answer is:',
        '42',
      ])
    ).toMatchInlineSnapshot(`
      [
        "Invalid type: Expected true but received false, path: 0.y",
        "Invalid set, expected set of strings, path: 0.k",
        "Invalid type: Expected "Uhm?" but received "Answer is:", path: 1",
        "Invalid type: Expected 42 but received "42", path: 2",
      ]
    `);
  });

  test('path from original valibot error included in final message', () => {
    const contract = valibotContract(
      v.object({
        x: v.number(),
        y: v.object({
          z: v.string(),
          k: v.object({
            j: v.boolean(),
          }),
        }),
      })
    );

    expect(
      contract.getErrorMessages({
        x: '42',
        y: {
          z: 123,
          k: {
            j: new Map(),
          },
        },
      })
    ).toMatchInlineSnapshot(`
      [
        "Invalid type: Expected number but received "42", path: x",
        "Invalid type: Expected string but received 123, path: y.z",
        "Invalid type: Expected boolean but received Map, path: y.k.j",
      ]
    `);
  });
});
