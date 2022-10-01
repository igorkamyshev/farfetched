import { expectType } from 'tsd';
import { Contract } from '@farfetched/core';
import { z } from 'zod';

import { zodContract } from '../zod_contract';

expectType<Contract<unknown, string>>(zodContract(z.string()));

type ComplexObject = [
  {
    x: number;
    y: false;
    z: Set<string>;
  },
  'literal',
  42
];

expectType<Contract<unknown, ComplexObject>>(
  zodContract(
    z.tuple([
      z.object({
        x: z.number(),
        y: z.literal(false),
        z: z.set(z.string()),
      }),
      z.literal('literal'),
      z.literal(42),
    ])
  )
);
