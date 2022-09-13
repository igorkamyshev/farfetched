import { createEffect, createStore } from 'effector';
import { expectType } from 'tsd';

import { Contract } from '../../contract/type';
import { unknownContract } from '../../contract/unknown_contract';
import { InvalidDataError } from '../../errors/type';
import { createQuery } from '../create_query';
import { Query } from '../type';

only_handler: {
  const numberToStringQuery = createQuery({
    handler: async (params: number) => params.toString(),
  });
  expectType<Query<number, string, unknown>>(numberToStringQuery);

  const objectToNumberQuery = createQuery({
    handler: async (config: { name: string; age: number }) => config.age,
  });
  expectType<Query<{ name: string; age: number }, number, unknown>>(
    objectToNumberQuery
  );

  const stringToObjectQuery = createQuery({
    handler: async (params: string) => ({ name: params }),
  });
  expectType<Query<string, { name: string }, unknown>>(stringToObjectQuery);
}

only_effect: {
  const numberToStringQuery = createQuery({
    effect: createEffect<number, string, { error: boolean }>(),
  });
  expectType<Query<number, string, { error: boolean }>>(numberToStringQuery);

  const objectToNumberQuery = createQuery({
    effect: createEffect<
      { name: string; age: number },
      number,
      { error: boolean }
    >(),
  });
  expectType<Query<{ name: string; age: number }, number, { error: boolean }>>(
    objectToNumberQuery
  );

  const stringToObjectQuery = createQuery({
    effect: createEffect<string, { name: string }, { error: boolean }>(),
  });
  expectType<Query<string, { name: string }, { error: boolean }>>(
    stringToObjectQuery
  );
}

effect_contract: {
  const numberWithStringQuery = createQuery({
    effect: createEffect<number, string, { effectError: boolean }>(),
    contract: {} as Contract<string, string>,
  });
  expectType<
    Query<
      number,
      string,
      | { effectError: boolean } // from effect
      | InvalidDataError // from data.validate
    >
  >(numberWithStringQuery);

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
}

effect_mapData: {
  const toNumberQuery = createQuery({
    effect: createEffect(() => 12),
    mapData: () => 12,
  });

  expectType<Query<void, number, Error>>(toNumberQuery);

  const toSourceQuery = createQuery({
    effect: createEffect(() => 12),
    mapData: {
      source: createStore(12),
      fn: (data: number, params: void, source: number) => 'string',
    },
  });

  expectType<Query<void, string, Error>>(toSourceQuery);
}

effect_contarct_mapData: {
  const toNumberQuery = createQuery({
    effect: createEffect(() => 12 as unknown),
    contract: unknownContract,
    mapData: () => 12,
  });

  expectType<Query<void, number, InvalidDataError | Error>>(toNumberQuery);

  const toSourceQuery = createQuery({
    effect: createEffect(() => 12 as unknown),
    contract: unknownContract,
    mapData: {
      source: createStore(12),
      fn: (data: unknown, params: void, source: number): string => 'string',
    },
  });

  expectType<Query<void, string, Error | InvalidDataError>>(toSourceQuery);
}
