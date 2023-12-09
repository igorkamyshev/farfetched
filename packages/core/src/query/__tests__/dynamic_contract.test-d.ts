import { describe, test, expectTypeOf } from 'vitest';
import { type Effect } from 'effector';

import { createQuery } from '../create_query';
import { type Contract } from '../../contract/type';
import { type Query } from '../type';

describe('createQuery, contarct with external source', () => {
  test('infer type from contract as function', () => {
    const contract: Contract<unknown, number> = {} as any;

    const effect: Effect<number, unknown, unknown> = {} as any;

    const q = createQuery({ effect, contract: () => contract });

    expectTypeOf(q).toEqualTypeOf<Query<number, number, unknown, null>>();
  });
});
