import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';
import { arr, obj } from '@withease/contracts';

import { Info } from '../../shared/info';
import { characterUrl } from './api';
import { Character } from './contract';

export function createCharacterQuery() {
  const q = createJsonQuery({
    params: declareParams<{ id: number }>(),
    request: {
      url: ({ id }) => characterUrl({ id }),
      method: 'GET',
    },
    response: { contract: Character },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}

export function createCharacterListQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { ids: number[] };
}) {
  const q = createJsonQuery({
    params: declareParams<T>(),
    request: {
      url: (params) => characterUrl(mapParams(params)),
      method: 'GET',
    },
    response: { contract: arr(Character) },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}

export function createCharacterPageQuery() {
  const q = createJsonQuery({
    params: declareParams<{ page: number }>(),
    request: {
      url: characterUrl(),
      query: ({ page }) => ({ page }),
      method: 'GET',
    },
    response: {
      contract: obj({ info: Info, results: arr(Character) }),
    },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}
