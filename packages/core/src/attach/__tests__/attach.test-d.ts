import { Store } from 'effector';
import { describe, expectTypeOf, test } from 'vitest';

import { Query } from '../../query/type';
import { attachOperation } from '../attach';

describe('attachOperation', () => {
  test('Query + source/mapParams, issue #280', () => {
    const query: Query<number, unknown, unknown, null> = {} as any;

    const $source: Store<number> = {} as any;

    const result = attachOperation(query, {
      source: $source,
      mapParams: (_: void, params) => params + 1,
    });

    expectTypeOf(result).toEqualTypeOf<Query<void, unknown, unknown, null>>();
  });
});
