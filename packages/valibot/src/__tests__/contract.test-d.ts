import { describe, test, expectTypeOf } from 'vitest';
import * as v from 'valibot';

import { valibotContract } from '../valibot_contract';

describe('valibotContract', () => {
  test('string', () => {
    const stringContract = valibotContract(v.string());

    const smth: unknown = null;

    if (stringContract.isData(smth)) {
      expectTypeOf(smth).toEqualTypeOf<string>();
      expectTypeOf(smth).not.toEqualTypeOf<number>();
    }
  });

  test('complex object', () => {
    const complexContract = valibotContract(
      v.tuple([
        v.object({
          x: v.number(),
          y: v.literal(false),
          k: v.set(v.string()),
        }),
        v.literal('literal'),
        v.literal(42),
      ])
    );

    const smth: unknown = null;

    if (complexContract.isData(smth)) {
      expectTypeOf(smth).toEqualTypeOf<
        [
          {
            x: number;
            y: false;
            k: Set<string>;
          },
          'literal',
          42,
        ]
      >();

      // ComplexObject is not a number
      expectTypeOf(smth).not.toEqualTypeOf<number>();

      // this is other complex object, x is string
      expectTypeOf(smth).not.toEqualTypeOf<
        [
          {
            x: string;
            y: false;
            k: Set<string>;
          },
          'literal',
          42,
        ]
      >();
    }
  });
});
