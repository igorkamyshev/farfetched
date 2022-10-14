import { expectType } from 'tsd';
import { Contract } from '@farfetched/core';
import { z as zod } from 'zod';

import { zodContract } from '../zod_contract';

expectType<Contract<unknown, string>>(zodContract(zod.string()));

type ComplexObject = [
  {
    x: number;
    y: false;
    k: Set<string>;
  },
  'literal',
  42
];

expectType<Contract<unknown, ComplexObject>>(
  zodContract(
    zod.tuple([
      zod.object({
        x: zod.number(),
        y: zod.literal(false),
        k: zod.set(zod.string()),
      }),
      zod.literal('literal'),
      zod.literal(42),
    ])
  )
);
