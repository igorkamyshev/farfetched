import { attachOperation } from '@farfetched/core';
import { sample } from 'effector';

import { episodeListRoute, episodePageQuery } from '../../entities/episode';

const episodesQuery = attachOperation(episodePageQuery);

const $currentPage = episodeListRoute.$params.map((params) => params.page ?? 1);

sample({
  clock: [episodeListRoute.opened, episodeListRoute.updated],
  source: { page: $currentPage },
  target: episodesQuery.start,
});

export { $currentPage, episodesQuery };
