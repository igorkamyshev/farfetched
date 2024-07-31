import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterListQuery } from '../../entities/character';
import { createEpisodeQuery, episodeRoute } from '../../entities/episode';
import { urlToId } from '../../shared/id';

export const curentEpisodeQuery = createEpisodeQuery();
export const charactersInEpisodeQuery = createCharacterListQuery({
  mapParams: (urls: string[]) => ({ ids: urls.map(urlToId) }),
});

connectQuery({
  source: curentEpisodeQuery,
  fn({ result: episode }) {
    return { params: episode.characters };
  },
  target: charactersInEpisodeQuery,
});

sample({
  clock: episodeRoute.opened,
  fn({ params }) {
    return { id: params.episodeId };
  },
  target: curentEpisodeQuery.start,
});
