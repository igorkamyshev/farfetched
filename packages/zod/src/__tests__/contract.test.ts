import { z } from 'zod';

import { zodContract } from '../zod_contract';

describe('zod/zodContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = zodContract(z.string());

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      Array [
        "Expected string, received number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = zodContract(z.string());

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });

  test('isData passes for valid data', () => {
    const contract = zodContract(
      z.object({
        x: z.number(),
        y: z.string(),
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
      z.object({
        x: z.number(),
        y: z.string(),
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
      z.tuple([
        z.object({
          x: z.number(),
          y: z.literal(true),
          z: z.set(z.string()).nonempty('Invalid set, expected set of strings'),
        }),
        z.literal('Uhm?'),
        z.literal(42),
      ])
    );

    expect(
      contract.getErrorMessages([
        {
          x: 456,
          y: false,
          z: new Set(),
        },
        'Answer is:',
        '42',
      ])
    ).toMatchInlineSnapshot(`
      Array [
        "Invalid literal value, expected true",
        "Invalid set, expected set of strings",
        "Invalid literal value, expected \\"Uhm?\\"",
        "Invalid literal value, expected 42",
      ]
    `);
  });
});
