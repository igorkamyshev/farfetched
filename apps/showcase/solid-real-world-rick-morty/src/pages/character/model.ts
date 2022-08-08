import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import { Character, characterRoute } from '../../entities/character';
import { Episode } from '../../entities/episode';
import { Location } from '../../entities/location';
import { urlToId } from '../../shared/id';

const characterQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    url: ({ id }) => `https://rickandmortyapi.com/api/character/${id}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Character) },
});

const originQuery = createJsonQuery({
  params: declareParams<{ url: string }>(),
  request: { url: ({ url }) => url, method: 'GET' },
  response: { contract: runtypeContract(Location) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { url: character.origin.url };
  },
  target: originQuery,
});

const currentLocationQuery = createJsonQuery({
  params: declareParams<{ locationUrl: string }>(),
  request: {
    url: ({ locationUrl }) => locationUrl,
    method: 'GET',
  },
  response: { contract: runtypeContract(Location) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { locationUrl: character.location.url };
  },
  target: currentLocationQuery,
});

const characterEpisodesQuery = createJsonQuery({
  params: declareParams<{ ids: number[] }>(),
  request: {
    url: ({ ids }) =>
      `https://rickandmortyapi.com/api/episode/[${ids.join(',')}]`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Episode)) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { ids: character.episode.map(urlToId) };
  },
  target: characterEpisodesQuery,
});

sample({
  clock: characterRoute.opened,
  fn: ({ params }) => ({ id: params.characterId }),
  target: characterQuery.start,
});

export {
  characterQuery,
  originQuery,
  currentLocationQuery,
  characterEpisodesQuery,
};
