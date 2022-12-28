import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterQuery, characterRoute } from '../../entities/character';
import { episodeListQuery } from '../../entities/episode';
import { locationQuery } from '../../entities/location';
import { urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const currentCharacterQuery = attachOperation(characterQuery);
const currentLocationQuery = attachOperation(locationQuery, {
  mapParams: (url: TUrl) => ({ id: urlToId(url) }),
});
const originQuery = attachOperation(locationQuery, {
  mapParams: (url: TUrl) => ({ id: urlToId(url) }),
});
const characterEpisodesQuery = attachOperation(episodeListQuery, {
  mapParams: (urls: TUrl[]) => ({ ids: urls.map(urlToId) }),
});

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: character.origin.url };
  },
  target: originQuery,
});

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: character.location.url };
  },
  target: currentLocationQuery,
});

connectQuery({
  source: characterQuery,
  fn({ result: character }) {
    return { params: character.episode };
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
