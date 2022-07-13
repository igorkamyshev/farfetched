import { createEffect, createStore } from 'effector';
import { expectType } from 'tsd';
import { InvalidDataError } from '../../contract/error';
import { unkownContract } from '../../contract/unkown_contract';

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
    contract: {
      data: { validate: () => null, extract: (p) => 'some string' },
      error: { is: () => true, extract: (p) => ({ contractError: 'string' }) },
    },
  });
  expectType<
    Query<
      number,
      string,
      | { effectError: boolean } // from effect
      | InvalidDataError<string> // from data.validate
      | { contractError: string } // from error.extract
    >
  >(numberWithStringQuery);

  // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
  const incorrectTypesInContractDataImpossibleQuery = createQuery({
    effect: createEffect<number, string, { effectError: boolean }>(),
    contract: {
      // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
      data: { validate: () => null, extract: (p: number) => 'some string' },
      error: { is: () => true, extract: (p) => ({ contractError: 'string' }) },
    },
  });

  // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
  const incorrectTypesInContractDataImpossibleQuery = createQuery({
    effect: createEffect<number, string, { effectError: boolean }>(),
    contract: {
      data: { validate: () => null, extract: (p) => 'some string' },
      error: {
        is: () => true,
        // @ts-expect-error it's impossiple to pass invalid type to extract (expect `string`, given `number`)
        extract: (p: number) => ({ contractError: 'string' }),
      },
    },
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
      fn: (data, params, source): string => 'string',
    },
  });

  expectType<Query<void, string, Error>>(toSourceQuery);
}

effect_contarct_mapData: {
  const toNumberQuery = createQuery({
    effect: createEffect(() => 12),
    contract: unkownContract,
    mapData: () => 12,
  });

  expectType<Query<void, number, unknown>>(toNumberQuery);

  const toSourceQuery = createQuery({
    effect: createEffect(() => 12),
    contract: unkownContract,
    mapData: {
      source: createStore(12),
      fn: (data: unknown, params: void, source: number): string => 'string',
    },
  });

  expectType<Query<void, string, unknown>>(toSourceQuery);
}
