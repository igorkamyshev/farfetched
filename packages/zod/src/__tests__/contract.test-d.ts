import { describe, test, expectTypeOf } from 'vitest';
import { z as zod } from 'zod';

import { zodContract } from '../zod_contract';

describe('zodContract', () => {
  test('string', () => {
    const stringContract = zodContract(zod.string());

    const smth: unknown = null;

    if (stringContract.isData(smth)) {
      expectTypeOf(smth).toEqualTypeOf<string>();

      // @ts-expect-error string is not a number
      expectTypeOf(smth).toEqualTypeOf<number>();
    }
  });

  test('complex object', () => {
    const complexContract = zodContract(
      zod.tuple([
        zod.object({
          x: zod.number(),
          y: zod.literal(false),
          k: zod.set(zod.string()),
        }),
        zod.literal('literal'),
        zod.literal(42),
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
          42
        ]
      >();

      // @ts-expect-error ComplexObject is not a number
      expectTypeOf(smth).toEqualTypeOf<number>();

      // @ts-expect-error this is other complex object, x is string
      expectTypeOf(smth).toEqualTypeOf<
        [
          {
            x: string;
            y: false;
            k: Set<string>;
          },
          'literal',
          42
        ]
      >();
    }
  });
});
