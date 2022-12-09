import { Mutation } from '@farfetched/core';
import { expectTypeOf, describe, test } from 'vitest';

import { useMutation } from '../use_mutation';

describe('useMutation', () => {
  test('mutation with params', () => {
    const mutationWithParams: Mutation<{ foo: string }, any, any> = null as any;

    const { start } = useMutation(mutationWithParams);

    expectTypeOf(start).toBeCallableWith({ foo: 'bar' });
    // @ts-expect-error should be callable with arguments
    expectTypeOf(start).toBeCallableWith();
  });

  test('mutation without params', () => {
    const mutationWithoutParams: Mutation<void, any, any> = null as any;

    const { start } = useMutation(mutationWithoutParams);

    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error should not be callable with arguments
    expectTypeOf(start).toBeCallableWith({});
  });
});
