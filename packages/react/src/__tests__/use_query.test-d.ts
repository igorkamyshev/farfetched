import { Query } from '@farfetched/core';
import { describe, test, expectTypeOf } from 'vitest';

import { useQuery } from '../use_query';

describe('useQuery', () => {
  test('void start', () => {
    const { data, error, pending, start } = useQuery(
      {} as Query<void, number, string>
    );

    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params have to be void
    expectTypeOf(start).toBeCallableWith({});

    expectTypeOf(data).toEqualTypeOf<number | null>();
    // @ts-expect-error data is number | null
    expectTypeOf(data).toEqualTypeOf<number>();

    expectTypeOf(error).toEqualTypeOf<string | null>();
    // @ts-expect-error error is string | null
    expectTypeOf(error).toEqualTypeOf<string>();

    expectTypeOf(pending).toEqualTypeOf<boolean>();
    // @ts-expect-error pending is boolean
    expectTypeOf(pending).toEqualTypeOf<string>();
  });

  test('start with params', () => {
    const { data, error, pending, start } = useQuery(
      {} as Query<{ limit: string }, number, string>
    );

    expectTypeOf(start).toBeCallableWith({ limit: '10' });
    // @ts-expect-error params is not void
    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params is not number
    expectTypeOf(start).toBeCallableWith(10);

    expectTypeOf(data).toEqualTypeOf<number | null>();
    // @ts-expect-error data is number | null
    expectTypeOf(data).toEqualTypeOf<number>();

    expectTypeOf(error).toEqualTypeOf<string | null>();
    // @ts-expect-error error is string | null
    expectTypeOf(error).toEqualTypeOf<string>();

    expectTypeOf(pending).toEqualTypeOf<boolean>();
    // @ts-expect-error pending is boolean
    expectTypeOf(pending).toEqualTypeOf<string>();
  });

  test('initial data and start with no params', () => {
    const { data, error, pending, start } = useQuery(
      {} as Query<void, number, string, number>
    );

    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params have to be void
    expectTypeOf(start).toBeCallableWith({});

    expectTypeOf(data).toEqualTypeOf<number>();
    // @ts-expect-error data is number
    expectTypeOf(data).toEqualTypeOf<number | null>();

    expectTypeOf(error).toEqualTypeOf<string | null>();
    // @ts-expect-error error is string | null
    expectTypeOf(error).toEqualTypeOf<string>();

    expectTypeOf(pending).toEqualTypeOf<boolean>();
    // @ts-expect-error pending is boolean
    expectTypeOf(pending).toEqualTypeOf<string>();
  });

  test('initial data and start with params', () => {
    const { data, error, pending, start } = useQuery(
      {} as Query<{ limit: string }, number, string, number>
    );

    expectTypeOf(start).toBeCallableWith({ limit: '10' });
    // @ts-expect-error params is not void
    expectTypeOf(start).toBeCallableWith();
    // @ts-expect-error params is not number
    expectTypeOf(start).toBeCallableWith(10);

    expectTypeOf(data).toEqualTypeOf<number>();
    // @ts-expect-error data is number
    expectTypeOf(data).toEqualTypeOf<number | null>();

    expectTypeOf(error).toEqualTypeOf<string | null>();
    // @ts-expect-error error is string | null
    expectTypeOf(error).toEqualTypeOf<string>();

    expectTypeOf(pending).toEqualTypeOf<boolean>();
    // @ts-expect-error pending is boolean
    expectTypeOf(pending).toEqualTypeOf<string>();
  });
});
