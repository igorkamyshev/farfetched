import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array, Record } from 'runtypes';

import { Episode, episodeListRoute } from '../../entities/episode';
import { Info } from '../../shared/info';

const episodesQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    url: 'https://rickandmortyapi.com/api/episode',
    query: ({ page }) => ({ page }),
    method: 'GET',
  },
  response: {
    contract: runtypeContract(Record({ info: Info, results: Array(Episode) })),
  },
});

const $currentPage = episodeListRoute.$params.map((params) => params.page ?? 1);

sample({
  clock: [episodeListRoute.opened, episodeListRoute.updated],
  source: $currentPage,
  fn(page) {
    return { page };
  },
  target: episodesQuery.start,
});

export { $currentPage, episodesQuery };
