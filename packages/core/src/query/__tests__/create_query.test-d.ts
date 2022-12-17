import { createEffect, createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { unknownContract } from '../../contract/unknown_contract';
import { InvalidDataError } from '../../errors/type';
import { createQuery } from '../create_query';
import { Query } from '../type';

describe('createQuery', () => {
  test('only handler', () => {
    const numberToStringQuery = createQuery({
      handler: async (params: number) => params.toString(),
    });
    expectTypeOf(numberToStringQuery).toEqualTypeOf<
      Query<number, string, unknown>
    >();

    const objectToNumberQuery = createQuery({
      handler: async (config: { name: string; age: number }) => config.age,
    });
    expectTypeOf(objectToNumberQuery).toEqualTypeOf<
      Query<{ name: string; age: number }, number, unknown>
    >();

    const stringToObjectQuery = createQuery({
      handler: async (params: string) => ({ name: params }),
    });
    expectTypeOf(stringToObjectQuery).toEqualTypeOf<
      Query<string, { name: string }, unknown>
    >();
  });

  test('only handler', () => {
    const numberToStringQuery = createQuery({
      effect: createEffect<number, string, { error: boolean }>(),
    });
    expectTypeOf(numberToStringQuery).toEqualTypeOf<
      Query<number, string, { error: boolean }>
    >();

    const objectToNumberQuery = createQuery({
      effect: createEffect<
        { name: string; age: number },
        number,
        { error: boolean }
      >(),
    });
    expectTypeOf(objectToNumberQuery).toEqualTypeOf<
      Query<{ name: string; age: number }, number, { error: boolean }>
    >();

    const stringToObjectQuery = createQuery({
      effect: createEffect<string, { name: string }, { error: boolean }>(),
    });
    expectTypeOf(stringToObjectQuery).toEqualTypeOf<
      Query<string, { name: string }, { error: boolean }>
    >();
  });

  test('effect and contract', () => {
    const numberWithStringQuery = createQuery({
      effect: createEffect<number, string, { effectError: boolean }>(),
      contract: {} as Contract<string, string>,
    });
    expectTypeOf(numberWithStringQuery).toEqualTypeOf<
      Query<
        number,
        string,
        | { effectError: boolean } // from effect
        | InvalidDataError // from data.validate
      >
    >;

    const incorrectTypesInContractDataImpossibleQuery = createQuery({
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
      effect: createEffect<number, string, { effectError: boolean }>(),
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
      contract: {} as Contract<number, string>,
    });

    const incorrectTypesInContractDataImpossibleQuery2 = createQuery({
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
      effect: createEffect<number, string, { effectError: boolean }>(),
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
      contract: {} as Contract<number, string>,
    });
  });

  test('effect and mapData', () => {
    const toNumberQuery = createQuery({
      effect: createEffect(() => 12),
      mapData: () => 12,
    });

    expectTypeOf(toNumberQuery).toEqualTypeOf<Query<void, number, Error>>();

    const toSourceQuery = createQuery({
      effect: createEffect(() => 12),
      mapData: {
        source: createStore(12),
        fn: (
          { result, params }: { result: number; params: void },
          source: number
        ) => 'string',
      },
    });

    expectTypeOf(toSourceQuery).toEqualTypeOf<Query<void, string, Error>>();
  });

  test('effect, contract and mapData', () => {
    const toNumberQuery = createQuery({
      effect: createEffect(() => 12 as unknown),
      contract: unknownContract,
      mapData: () => 12,
    });

    expectTypeOf(toNumberQuery).toEqualTypeOf<
      Query<void, number, InvalidDataError | Error>
    >();

    const toSourceQuery = createQuery({
      effect: createEffect(() => 12 as unknown),
      contract: unknownContract,
      mapData: {
        source: createStore(12),
        fn: (
          { result, params }: { result: unknown; params: void },
          source: number
        ): string => 'string',
      },
    });

    expectTypeOf(toSourceQuery).toEqualTypeOf<
      Query<void, string, InvalidDataError | Error>
    >();
  });

  test('initial value', () => {
    const handleQuery = createQuery({
      initialData: 1,
      handler: async (_: void) => 12,
    });
    expectTypeOf(handleQuery).toEqualTypeOf<
      Query<void, number, unknown, number>
    >();

    const effectQuery = createQuery({
      initialData: 1,
      effect: createEffect((): number => 12),
    });
    expectTypeOf(effectQuery).toEqualTypeOf<
      Query<void, number, Error, number>
    >();

    const effectContarctQuery = createQuery({
      initialData: 1,
      effect: createEffect<string, unknown, { effectError: boolean }>(),
      contract: {} as Contract<unknown, number>,
    });
    expectTypeOf(effectContarctQuery).toEqualTypeOf<
      Query<
        string,
        number,
        | { effectError: boolean } // from effect
        | InvalidDataError, // from data.validate
        number
      >
    >();

    const effectMapDataQuery = createQuery({
      initialData: 12,
      effect: createEffect(() => 12),
      mapData: () => 12,
    });
    expectTypeOf(effectMapDataQuery).toEqualTypeOf<
      Query<void, number, Error, number>
    >();

    const effectContractMapDataQuery = createQuery({
      initialData: 42,
      effect: createEffect(() => 12 as unknown),
      contract: unknownContract,
      mapData: () => 12,
    });

    expectTypeOf(effectContractMapDataQuery).toEqualTypeOf<
      Query<void, number, InvalidDataError | Error, number>
    >();
  });
});
