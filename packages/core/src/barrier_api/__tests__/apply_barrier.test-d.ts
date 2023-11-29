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
});
