import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { unknownContract } from '../../contract/unknown_contract';
import { createHeadlessQuery } from '../create_headless_query';
import { Query } from '../type';

describe('createHeadlessQuery', () => {
  test('contract', () => {
    const numberContract = {} as Contract<unknown, number>;

    const numberQuery = createHeadlessQuery({
      contract: numberContract,
      mapData: ({ result }) => result,
    });

    expectTypeOf(numberQuery).toEqualTypeOf<
      Query<unknown, number, unknown | number>
    >();

    const stringContract = {} as Contract<unknown, string>;

    const stringQuery = createHeadlessQuery({
      contract: stringContract,
      mapData: ({ result }) => result,
    });

    expectTypeOf(stringQuery).toEqualTypeOf<
      Query<unknown, string, unknown | number>
    >();
  });

  test('mapData as callbacl', () => {
    const numberQuery = createHeadlessQuery({
      contract: unknownContract,
      mapData: ({ result, params }) => 12,
    });

    expectTypeOf(numberQuery).toEqualTypeOf<Query<unknown, number, unknown>>();

    const objectQuery = createHeadlessQuery({
      contract: unknownContract,
      mapData: ({ result, params }) => ({ response: 12 }),
    });

    expectTypeOf(objectQuery).toEqualTypeOf<
      Query<unknown, { response: number }, unknown>
    >();
  });

  test('mapData as store and callback', () => {
    const numberQuery = createHeadlessQuery({
      contract: unknownContract,
      mapData: {
        source: createStore(0),
        fn: ({ result, params }, source) => {
          expectTypeOf(source).toBeNumber();
          return 12;
        },
      },
    });

    expectTypeOf(numberQuery).toEqualTypeOf<Query<unknown, number, unknown>>();

    const objectQuery = createHeadlessQuery({
      contract: unknownContract,
      mapData: {
        source: createStore({ response: 12 }),
        fn: ({ result, params }, source) => {
          expectTypeOf(source).toEqualTypeOf<{ response: number }>();
          return source;
        },
      },
    });

    expectTypeOf(objectQuery).toEqualTypeOf<
      Query<unknown, { response: number }, unknown>
    >();
  });
});
