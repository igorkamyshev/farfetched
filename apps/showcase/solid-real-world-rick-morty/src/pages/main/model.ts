import { exponentialDelay, retry } from '@farfetched/core';
import { sample } from 'effector';

import {
  characterListRoute,
  createCharacterPageQuery,
} from '../../entities/character';

const allCharactersQuery = createCharacterPageQuery();

retry(allCharactersQuery, { times: 3, delay: exponentialDelay(50) });

const $currentPage = characterListRoute.$params.map(
  (params) => params.page ?? 1
);

sample({
  clock: [characterListRoute.opened, characterListRoute.updated],
  source: { page: $currentPage },
  target: allCharactersQuery.start,
});

export { $currentPage, allCharactersQuery };
