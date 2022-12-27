import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterQuery, characterRoute } from '../../entities/character';
import { episodeListQuery } from '../../entities/episode';
import { locationQuery } from '../../entities/location';
import { urlToId } from '../../shared/id';

const currentCharacterQuery = attachOperation(characterQuery);

const originQuery = attachOperation(locationQuery);

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: { id: urlToId(character.origin.url) } };
  },
  target: originQuery,
});

const currentLocationQuery = attachOperation(locationQuery);

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: { id: urlToId(character.location.url) } };
  },
  target: currentLocationQuery,
});

const characterEpisodesQuery = attachOperation(episodeListQuery);

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: { ids: character.episode.map(urlToId) } };
  },
  target: characterEpisodesQuery,
});

sample({
  clock: characterRoute.opened,
  fn: ({ params }) => ({ id: params.characterId }),
  target: currentCharacterQuery.start,
});

export {
  currentCharacterQuery,
  originQuery,
  currentLocationQuery,
  characterEpisodesQuery,
};
