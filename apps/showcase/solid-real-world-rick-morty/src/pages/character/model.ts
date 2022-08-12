import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import {
  Character,
  characterRoute,
  characterUrl,
} from '../../entities/character';
import { Episode, episodeUrl } from '../../entities/episode';
import { Location, locationUrl } from '../../entities/location';
import { TId, urlToId } from '../../shared/id';

const characterQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => characterUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Character) },
});

const originQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: { url: ({ id }) => locationUrl({ id }), method: 'GET' },
  response: { contract: runtypeContract(Location) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { id: urlToId(character.origin.url) };
  },
  target: originQuery,
});

const currentLocationQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => locationUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Location) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { id: urlToId(character.location.url) };
  },
  target: currentLocationQuery,
});

const characterEpisodesQuery = createJsonQuery({
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: ({ ids }) => episodeUrl({ ids }),
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
