import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';
import { arr, obj } from '@withease/contracts';

import { Info } from '../../shared/info';
import { episodeUrl } from './api';
import { Episode } from './contract';

export function createEpisodeQuery() {
  const q = createJsonQuery({
    params: declareParams<{ id: number }>(),
    request: {
      url: ({ id }) => episodeUrl({ id }),
      method: 'GET',
    },
    response: { contract: Episode },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}

export function createEpisodeListQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { ids: number[] };
}) {
  const q = createJsonQuery({
    params: declareParams<T>(),
    request: {
      url: (params) => episodeUrl(mapParams(params)),
      method: 'GET',
    },
    response: { contract: arr(Episode) },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}

export function createEpisodePageQuery() {
  const q = createJsonQuery({
    params: declareParams<{ page: number }>(),
    request: {
      url: episodeUrl(),
      query: ({ page }) => ({ page }),
      method: 'GET',
    },
    response: {
      contract: obj({ info: Info, results: arr(Episode) }),
    },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}
