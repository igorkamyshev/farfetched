import { z as zod } from 'zod';
import { describe, test, expect } from 'vitest';

import { zodContract } from '../zod_contract';

describe('zod/zodContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = zodContract(zod.string());

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      [
        "Expected string, received number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = zodContract(zod.string());

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });

  test('isData passes for valid data', () => {
    const contract = zodContract(
      zod.object({
        x: zod.number(),
        y: zod.string(),
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
    const contract = zodContract(
      zod.object({
        x: zod.number(),
        y: zod.string(),
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
    const contract = zodContract(
      zod.tuple([
        zod.object({
          x: zod.number(),
          y: zod.literal(true),
          k: zod
            .set(zod.string())
            .nonempty('Invalid set, expected set of strings'),
        }),
        zod.literal('Uhm?'),
        zod.literal(42),
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
        "Invalid literal value, expected true",
        "Invalid set, expected set of strings",
        "Invalid literal value, expected \\"Uhm?\\"",
        "Invalid literal value, expected 42",
      ]
    `);
  });
});
