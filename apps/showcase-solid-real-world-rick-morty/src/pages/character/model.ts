import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterQuery, characterRoute } from '../../entities/character';
import { createEpisodeListQuery } from '../../entities/episode';
import { createLocationQuery } from '../../entities/location';
import { urlToId } from '../../shared/id';

export const currentCharacterQuery = createCharacterQuery();
export const currentLocationQuery = createLocationQuery({
  mapParams: (url: string) => ({ id: urlToId(url) }),
});
export const originQuery = createLocationQuery({
  mapParams: (url: string) => ({ id: urlToId(url) }),
});
export const characterEpisodesQuery = createEpisodeListQuery({
  mapParams: (urls: string[]) => ({ ids: urls.map(urlToId) }),
});

connectQuery({
  source: currentCharacterQuery,
  fn({ result: character }) {
    return { params: character.origin.url };
  },
  target: originQuery,
});

connectQuery({
  source: currentCharacterQuery,
  fn({ result: character }) {
    return { params: character.location.url };
  },
  target: currentLocationQuery,
});

connectQuery({
  source: currentCharacterQuery,
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
