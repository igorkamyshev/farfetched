import type { Query } from '@farfetched/core';
import { expectTypeOf, describe, test } from 'vitest';

import { createQueryResource } from '../create_query_resource';

describe('createQueryResource', () => {
  test('void start', () => {
    const [data, { start }] = createQueryResource(
      {} as Query<void, number, string>
    );

    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error should not be callable with arguments
    expectTypeOf(start).toBeCallableWith({});

    expectTypeOf(data()).toEqualTypeOf<number | undefined>();
    // @ts-expect-error cannot be string
    expectTypeOf(data()).toEqualTypeOf<string>();
  });

  test('start with params', () => {
    const [data, { start }] = createQueryResource(
      {} as Query<{ limit: string }, number, string>
    );

    expectTypeOf(start).toBeCallableWith({ limit: '1' });
    // @ts-expect-error should be callable with arguments
    expectTypeOf(start).toBeCallableWith();

    expectTypeOf(data()).toEqualTypeOf<number | undefined>();
    // @ts-expect-error cannot be string
    expectTypeOf(data()).toEqualTypeOf<string>();
  });
});
