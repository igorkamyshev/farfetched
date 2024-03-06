import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { TId } from '../../shared/id';
import { Info } from '../../shared/info';
import { episodeUrl } from './api';
import { Episode } from './contract';

export function createEpisodeQuery() {
  const q = createJsonQuery({
    params: declareParams<{ id: TId }>(),
    request: {
      url: ({ id }) => episodeUrl({ id }),
      method: 'GET',
    },
    response: { contract: runtypeContract(Episode) },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}

export function createEpisodeListQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { ids: TId[] };
}) {
  const q = createJsonQuery({
    params: declareParams<T>(),
    request: {
      url: (params) => episodeUrl(mapParams(params)),
      method: 'GET',
    },
    response: { contract: runtypeContract(Array(Episode)) },
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
      contract: runtypeContract(
        Record({ info: Info, results: Array(Episode) })
      ),
    },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}
