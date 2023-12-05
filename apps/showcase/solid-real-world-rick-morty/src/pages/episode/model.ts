import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterListQuery } from '../../entities/character';
import { createEpisodeQuery, episodeRoute } from '../../entities/episode';
import { urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const curentEpisodeQuery = createEpisodeQuery();
const charactersInEpisodeQuery = createCharacterListQuery({
  mapParams: (urls: TUrl[]) => ({ ids: urls.map(urlToId) }),
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

export { episodeRoute, curentEpisodeQuery, charactersInEpisodeQuery };
