import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import { Character } from '../../entities/character';
import { Episode, episodeRoute } from '../../entities/episode';
import { urlToId } from '../../shared/id';

const episodeQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    url: ({ id }) => `https://rickandmortyapi.com/api/episode/${id}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Episode) },
});

const charactersInEpisodeQuery = createJsonQuery({
  params: declareParams<{ ids: number[] }>(),
  request: {
    url: ({ ids }) =>
      `https://rickandmortyapi.com/api/character/${ids.join(',')}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Character)) },
});

connectQuery({
  source: { episode: episodeQuery },
  fn({ episode }) {
    return { ids: episode.characters.map(urlToId) };
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
