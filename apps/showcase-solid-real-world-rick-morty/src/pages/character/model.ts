import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterQuery, characterRoute } from '../../entities/character';
import { createEpisodeListQuery } from '../../entities/episode';
import { createLocationQuery } from '../../entities/location';
import { urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const currentCharacterQuery = createCharacterQuery();
const currentLocationQuery = createLocationQuery({
  mapParams: (url: TUrl) => ({ id: urlToId(url) }),
});
const originQuery = createLocationQuery({
  mapParams: (url: TUrl) => ({ id: urlToId(url) }),
});
const characterEpisodesQuery = createEpisodeListQuery({
  mapParams: (urls: TUrl[]) => ({ ids: urls.map(urlToId) }),
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

export {
  currentCharacterQuery,
  originQuery,
  currentLocationQuery,
  characterEpisodesQuery,
};
