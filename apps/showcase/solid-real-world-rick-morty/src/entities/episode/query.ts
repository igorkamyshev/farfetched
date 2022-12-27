import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { TId } from '../../shared/id';
import { Info } from '../../shared/info';
import { episodeUrl } from './api';
import { Episode } from './contract';

export const episodeQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => episodeUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Episode) },
});

export const episodeListQuery = createJsonQuery({
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: ({ ids }) => episodeUrl({ ids }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Episode)) },
});

export const episodePageQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    url: episodeUrl(),
    query: ({ page }) => ({ page }),
    method: 'GET',
  },
  response: {
    contract: runtypeContract(Record({ info: Info, results: Array(Episode) })),
  },
});
