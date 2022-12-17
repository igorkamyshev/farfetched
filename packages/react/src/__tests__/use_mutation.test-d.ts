import { Mutation } from '@farfetched/core';
import { describe, test, expectTypeOf } from 'vitest';

import { useMutation } from '../use_mutation';

describe('userMutation', () => {
  test('mutation with params', () => {
    const { start } = useMutation({} as Mutation<{ foo: string }, any, any>);

    expectTypeOf(start).toBeCallableWith({ foo: 'bar' });
    // @ts-expect-error params is not void
    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params is not number
    expectTypeOf(start).toBeCallableWith(10);
  });

  test('mutation without params', () => {
    const { start } = useMutation({} as Mutation<void, any, any>);

    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params have to be void
    expectTypeOf(start).toBeCallableWith({});
  });
});
