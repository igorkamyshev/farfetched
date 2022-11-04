import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array, Record } from 'runtypes';

import { Episode, episodeListRoute, episodeUrl } from '../../entities/episode';
import { rootDomain } from '../../shared/domain';
import { Info } from '../../shared/info';

const episodesQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    url: episodeUrl(),
    query: ({ page }) => ({ page }),
    method: 'GET',
  },
  response: {
    contract: runtypeContract(Record({ info: Info, results: Array(Episode) })),
  },
  enabled: episodeListRoute.$isOpened,
  domain: rootDomain,
  name: 'episodesQuery',
});

const $currentPage = episodeListRoute.$params.map((params) => params.page ?? 1);

sample({
  clock: [episodeListRoute.opened, episodeListRoute.updated],
  source: { page: $currentPage },
  target: episodesQuery.start,
});

export { $currentPage, episodesQuery };
