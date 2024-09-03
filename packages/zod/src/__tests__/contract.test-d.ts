import { describe, test, expectTypeOf } from 'vitest';
import { z as zod } from 'zod';

import { zodContract } from '../zod_contract';

describe('zodContract', () => {
  test('string', () => {
    const stringContract = zodContract(zod.string());

    const smth: unknown = null;

    if (stringContract.isData(smth)) {
      expectTypeOf(smth).toEqualTypeOf<string>();
      expectTypeOf(smth).not.toEqualTypeOf<number>();
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
          42,
        ]
      >();

      expectTypeOf(smth).not.toEqualTypeOf<number>();

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

  test('branded type', () => {
    const BrandedContainer = zod.object({
      branded: zod.string().brand<'Branded'>()
   })
    const brandedContract = zodContract(BrandedContainer)

    const smth: unknown = { branded: 'branded' };

    if (brandedContract.isData(smth)) {
      expectTypeOf(smth).toEqualTypeOf<zod.infer<typeof BrandedContainer>>();
    }
  })
});
