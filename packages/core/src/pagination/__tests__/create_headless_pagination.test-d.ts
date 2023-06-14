import { describe, test, expectTypeOf } from 'vitest';
import { createHeadlessPagination } from '../create_headless_pagination';
import { unknownContract } from '../../contract/unknown_contract';
import { Pagination, ParamsAndResult, RequiredPageParams } from '../type';
import { Contract } from '../../contract/type';
import { createStore } from 'effector';

const baseConfig = {
  contract: unknownContract,
  hasNextPage: () => true,
  hasPrevPage: () => false,
};

describe('createHeadlessPagination', () => {
  test('simple creation', () => {
    const unknownPagination = createHeadlessPagination({
      ...baseConfig,
      mapData: ({ result }) => result,
    });

    expectTypeOf(unknownPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, unknown, unknown>
    >();

    const initialDataPagination = createHeadlessPagination({
      ...baseConfig,
      initialData: 12,
      mapData: ({ result }) => result,
    });

    expectTypeOf(initialDataPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, unknown, unknown, number>
    >();
  });

  test('contract', () => {
    const numberContract = createHeadlessPagination({
      ...baseConfig,
      contract: {} as Contract<unknown, number>,
      mapData: ({ result }) => result,
    });

    expectTypeOf(numberContract).toEqualTypeOf<
      Pagination<RequiredPageParams, number, unknown>
    >();

    const stringContract = createHeadlessPagination({
      ...baseConfig,
      contract: {} as Contract<unknown, string>,
      mapData: ({ result }) => result,
    });

    expectTypeOf(stringContract).toEqualTypeOf<
      Pagination<RequiredPageParams, string, unknown>
    >();
  });

  test('mapData', () => {
    const primitiveCallbackMapData = createHeadlessPagination({
      ...baseConfig,
      mapData: ({ result }) => result as string,
    });

    expectTypeOf(primitiveCallbackMapData).toEqualTypeOf<
      Pagination<RequiredPageParams, string, unknown>
    >();

    const objectCallbackMapData = createHeadlessPagination({
      ...baseConfig,
      mapData: () => ({ data: 42 }),
    });

    expectTypeOf(objectCallbackMapData).toEqualTypeOf<
      Pagination<RequiredPageParams, { data: number }, unknown>
    >();

    const sourcedMapData = createHeadlessPagination({
      ...baseConfig,
      mapData: {
        source: createStore(0),
        fn: ({ result }, source) => {
          expectTypeOf(source).toEqualTypeOf<number>();
          return result as number;
        },
      },
    });

    expectTypeOf(sourcedMapData).toEqualTypeOf<
      Pagination<RequiredPageParams, number, unknown>
    >();
  });

  test('extended params', () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      mapData: (
        config: ParamsAndResult<RequiredPageParams & { other: number }, unknown>
      ) => config.result,
    });

    expectTypeOf(pagination).toEqualTypeOf<
      Pagination<RequiredPageParams & { other: number }, unknown, unknown>
    >();
  });
});
