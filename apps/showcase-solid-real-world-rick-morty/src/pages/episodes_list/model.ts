import { sample } from 'effector';

import {
  episodeListRoute,
  createEpisodePageQuery,
} from '../../entities/episode';

export const episodesQuery = createEpisodePageQuery();

export const $currentPage = episodeListRoute.$params.map(
  (params) => params.page ?? 1
);

sample({
  clock: [episodeListRoute.opened, episodeListRoute.updated],
  source: { page: $currentPage },
  target: episodesQuery.start,
});
