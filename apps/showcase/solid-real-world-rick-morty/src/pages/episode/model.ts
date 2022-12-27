import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterListQuery } from '../../entities/character';
import { episodeQuery, episodeRoute } from '../../entities/episode';
import { urlToId } from '../../shared/id';

const cuurentEpisodeQuery = attachOperation(episodeQuery);

const charactersInEpisodeQuery = attachOperation(characterListQuery);

connectQuery({
  source: cuurentEpisodeQuery,
  fn({ result: episode }) {
    return { params: { ids: episode.characters.map(urlToId) } };
  },
  target: charactersInEpisodeQuery,
});

sample({
  clock: episodeRoute.opened,
  fn({ params }) {
    return { id: params.episodeId };
  },
  target: cuurentEpisodeQuery.start,
});

export { episodeRoute, cuurentEpisodeQuery, charactersInEpisodeQuery };
