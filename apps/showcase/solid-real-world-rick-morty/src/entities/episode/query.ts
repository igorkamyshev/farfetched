import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { TId } from '../../shared/id';
import { Info } from '../../shared/info';
import { episodeUrl } from './api';
import { Episode } from './contract';

export function createEpisodeQuery() {
  return createJsonQuery({
    params: declareParams<{ id: TId }>(),
    request: {
      url: ({ id }) => episodeUrl({ id }),
      method: 'GET',
    },
    response: { contract: runtypeContract(Episode) },
  });
}

export function createEpisodeListQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { ids: TId[] };
}) {
  return createJsonQuery({
    params: declareParams<T>(),
    request: {
      url: (params) => episodeUrl(mapParams(params)),
      method: 'GET',
    },
    response: { contract: runtypeContract(Array(Episode)) },
  });
}

export function createEpisodePageQuery() {
  return createJsonQuery({
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
}
