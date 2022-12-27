import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterListQuery } from '../../entities/character';
import { episodeQuery, episodeRoute } from '../../entities/episode';
import { urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const curentEpisodeQuery = attachOperation(episodeQuery);
const charactersInEpisodeQuery = attachOperation(characterListQuery, {
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
