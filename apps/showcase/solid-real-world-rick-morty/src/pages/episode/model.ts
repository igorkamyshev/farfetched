import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import { Character, characterUrl } from '../../entities/character';
import { Episode, episodeRoute, episodeUrl } from '../../entities/episode';
import { TId, urlToId } from '../../shared/id';

const episodeQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => episodeUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Episode) },
});

const charactersInEpisodeQuery = createJsonQuery({
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: ({ ids }) => characterUrl({ ids }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Character)) },
});

connectQuery({
  source: episodeQuery,
  fn(episode) {
    return { params: { ids: episode.characters.map(urlToId) } };
  },
  target: charactersInEpisodeQuery,
});

sample({
  clock: episodeRoute.opened,
  fn({ params }) {
    return { id: params.episodeId };
  },
  target: episodeQuery.start,
});

export { episodeRoute, episodeQuery, charactersInEpisodeQuery };
