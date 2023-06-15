/* eslint-disable @typescript-eslint/no-unused-vars */
import { createEffect, createStore } from 'effector';
import { expectTypeOf, describe, test } from 'vitest';

import { Contract } from '../../contract/type';
import { createPagination } from '../create_pagination';
import { InvalidDataError } from '../../errors/type';
import { Pagination, ParamsAndResult, RequiredPageParams } from '../type';

const baseConfig = {
  hasNextPage: () => true,
  hasPrevPage: () => true,
};

describe('createPagination', () => {
  test('only handler', () => {
    const numericPagination = createPagination({
      ...baseConfig,
      handler: () => 42,
    });

    expectTypeOf(numericPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, number, unknown>
    >();

    const withParams = createPagination({
      ...baseConfig,
      handler: ({ n }: { page: number; n: string }) => n,
    });

    expectTypeOf(withParams).toEqualTypeOf<
      Pagination<{ page: number; n: string }, string, unknown>
    >();
  });

  test('only effect', () => {
    const numericPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, number, Error>(),
    });

    expectTypeOf(numericPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, number, Error>
    >();

    const withParams = createPagination({
      ...baseConfig,
      effect: createEffect<
        RequiredPageParams & { param: number },
        number,
        { error: boolean }
      >(),
    });

    expectTypeOf(withParams).toEqualTypeOf<
      Pagination<
        RequiredPageParams & { param: number },
        number,
        { error: boolean }
      >
    >();
  });

  // 'Cause handler and effect work the same
  // So I'll be test only with effect

  test('effect and mapData', () => {
    const stringifyPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, { param: number }>(),
      mapData: ({ result, params }) => result.param,
    });

    expectTypeOf(stringifyPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, string, Error>
    >();

    const sourcedMapDataPagination = createPagination({
      hasNextPage: (params) => true,
      hasPrevPage: (params) => true,
      effect: createEffect<RequiredPageParams, number, Error>(),
      mapData: {
        source: createStore(0),
        fn: ({ result, params }, source) => {
          return result.toString();
        },
      },
    });

    expectTypeOf(sourcedMapDataPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, string, Error>
    >();
  });

  test('effect and contract', () => {
    const stringPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, number>(),
      contract: {} as Contract<number, 6>,
    });

    expectTypeOf(stringPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, 6, Error | InvalidDataError>
    >();

    const incorrect1 = createPagination({
      ...baseConfig,
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `number`, given `string`)
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `number`, given `string`)
      contract: {} as Contract<string, 6>,
    });
  });

  test('effect, contract and mapData', () => {
    const callbackPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      contract: {} as Contract<number, 6>,
      mapData: ({ result, params }) => 'string',
    });

    expectTypeOf(callbackPagination).toEqualTypeOf<
      Pagination<
        RequiredPageParams,
        string,
        { error: boolean } | InvalidDataError
      >
    >();

    const sourcedPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      contract: {} as Contract<number, number>,
      mapData: {
        source: createStore(0),
        fn: ({ result, params }, number) => true,
      },
    });

    expectTypeOf(sourcedPagination).toEqualTypeOf<
      Pagination<
        RequiredPageParams,
        boolean,
        { error: boolean } | InvalidDataError
      >
    >();
  });

  test('with initialData', () => {
    const handlerPagination = createPagination({
      ...baseConfig,
      handler: () => 12,
      initialData: 15,
    });

    expectTypeOf(handlerPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, number, unknown, number>
    >();

    const effectPagination = createPagination({
      ...baseConfig,
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      initialData: 15,
    });

    expectTypeOf(effectPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, number, { error: boolean }, number>
    >();

    const mapDataPagination = createPagination({
      ...baseConfig,
      initialData: '',
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      mapData: ({ result, params }) => 'string',
    });

    expectTypeOf(mapDataPagination).toEqualTypeOf<
      Pagination<RequiredPageParams, string, { error: boolean }, string>
    >();

    const contractPagination = createPagination({
      ...baseConfig,
      initialData: 14,
      effect: createEffect<RequiredPageParams, number, { error: boolean }>(),
      contract: {} as Contract<number, number>,
    });

    expectTypeOf(contractPagination).toEqualTypeOf<
      Pagination<
        RequiredPageParams,
        number,
        { error: boolean } | InvalidDataError,
        number
      >
    >();
  });
});
