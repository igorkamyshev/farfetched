import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { TId } from '../../shared/id';
import { Info } from '../../shared/info';
import { characterUrl } from './api';
import { Character } from './contract';

export function createCharacterQuery() {
  return createJsonQuery({
    params: declareParams<{ id: TId }>(),
    request: {
      url: ({ id }) => characterUrl({ id }),
      method: 'GET',
    },
    response: { contract: runtypeContract(Character) },
  });
}

export function createCharacterListQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { ids: TId[] };
}) {
  return createJsonQuery({
    params: declareParams<T>(),
    request: {
      url: (params) => characterUrl(mapParams(params)),
      method: 'GET',
    },
    response: { contract: runtypeContract(Array(Character)) },
  });
}

export function createCharacterPageQuery() {
  return createJsonQuery({
    params: declareParams<{ page: number }>(),
    request: {
      url: characterUrl(),
      query: ({ page }) => ({ page }),
      method: 'GET',
    },
    response: {
      contract: runtypeContract(
        Record({ info: Info, results: Array(Character) })
      ),
    },
  });
}
