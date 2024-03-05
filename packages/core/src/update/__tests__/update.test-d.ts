import { type Effect } from 'effector';
import { expectTypeOf, test, describe } from 'vitest';

import { createMutation } from '../../mutation/create_mutation';
import { createQuery } from '../../query/create_query';
import { Mutation } from '../../mutation/type';
import { Query } from '../../query/type';
import { update } from '../update';

describe('update', () => {
  test('allow to return defaultValue from callback, issue #432', () => {
    const query: Query<void, number, any, string> = {} as any;
    const mutation: Mutation<void, number, any> = {} as any;

    update(query, {
      on: mutation,
      by: {
        success: () => {
          return { result: 'defaultValue' };
        },
      },
    });
  });

  test('use null if initial data type is not provided, issue #370', () => {
    const queryFx: Effect<void, number[]> = {} as any;
    const mutationFx: Effect<number, number> = {} as any;

    const query = createQuery({
      effect: queryFx,
    });

    const mutation = createMutation({
      effect: mutationFx,
    });

    update(query, {
      on: mutation,
      by: {
        success: ({ query }) => {
          expectTypeOf(query).toMatchTypeOf<
            | {
                result: number[];
                params: void;
              }
            | {
                error: Error;
                params: void;
              }
            | null
          >();

          return {
            result: [],
          };
        },
      },
    });
  });

  test('use initial data type in case of not started query, issue #370', () => {
    const queryFx: Effect<void, number[]> = {} as any;
    const mutationFx: Effect<number, number> = {} as any;

    const query = createQuery({
      effect: queryFx,
      initialData: [],
    });

    const mutation = createMutation({
      effect: mutationFx,
    });

    update(query, {
      on: mutation,
      by: {
        success: ({ query }) => {
          expectTypeOf(query).toMatchTypeOf<
            | {
                result: number[];
                params: void;
              }
            | {
                error: Error;
                params: void;
              }
            | { result: number[] }
          >();
          return {
            result: [],
          };
        },
      },
    });
  });
});
