import { describe, expectTypeOf, test } from 'vitest';
import { createStore } from 'effector';

import { type Query } from '../../query/type';
import { type Mutation } from '../../mutation/type';
import { type Barrier } from '../type';
import { applyBarrier } from '../apply_barrier';

describe('applyBarrier', () => {
  const barrier: Barrier = {} as any;

  test('allow query with no params', () => {
    const query: Query<void, unknown, unknown, unknown> = {} as any;

    applyBarrier(query, { barrier });
  });

  test('allow query with params', () => {
    const query: Query<{ id: number }, unknown, unknown, unknown> = {} as any;

    applyBarrier(query, { barrier });
  });

  test('allow mutation with no params', () => {
    const mutation: Mutation<void, unknown, unknown> = {} as any;

    applyBarrier(mutation, { barrier });
  });

  test('allow mutation with params', () => {
    const mutation: Mutation<{ id: number }, unknown, unknown> = {} as any;

    applyBarrier(mutation, { barrier });
  });

  test('forbid resumeParams for no params Query', () => {
    const query: Query<void, unknown, unknown, unknown> = {} as any;

    // @ts-expect-error resumeParams is not allowed for Query<void, ...>
    applyBarrier(query, { barrier, resumeParams });
  });

  test('infer resumeParams for Query with params in callback', () => {
    const query: Query<{ id: number }, unknown, unknown, unknown> = {} as any;

    applyBarrier(query, {
      barrier,
      resumeParams: ({ params }) => {
        expectTypeOf(params).toEqualTypeOf<{ id: number }>();

        return params;
      },
    });
  });

  test('result type of resumeParams matches Query params type', () => {
    const query: Query<{ id: number }, unknown, unknown, unknown> = {} as any;

    // @ts-expect-error id in resumeParams return type has to be number
    applyBarrier(query, {
      barrier,
      resumeParams: ({ params }) => {
        return { id: '' };
      },
    });
  });

  test('infer type of source in resumeParams', () => {
    const query: Query<{ id: number }, unknown, unknown, unknown> = {} as any;

    applyBarrier(query, {
      barrier,
      resumeParams: {
        source: createStore(1),
        fn: ({ params }, source) => {
          expectTypeOf(source).toEqualTypeOf<number>();
          expectTypeOf(params).toEqualTypeOf<{ id: number }>();
          return params;
        },
      },
    });
  });
});
