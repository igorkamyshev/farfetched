import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array, Record } from 'runtypes';

import { Character, characterListRoute } from '../../entities/character';
import { Info } from '../../shared/info';

const characterListQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    url: 'https://rickandmortyapi.com/api/character/',
    query: ({ page }) => ({ page: page.toString() }),
    method: 'GET',
  },
  response: {
    contract: runtypeContract(
      Record({ info: Info, results: Array(Character) })
    ),
  },
});

const $currentPage = characterListRoute.$params.map(
  (params) => params.page ?? 1
);

sample({
  clock: [characterListRoute.opened, characterListRoute.updated],
  source: $currentPage,
  fn(currentPage) {
    return { page: currentPage };
  },
  target: characterListQuery.start,
});

export { $currentPage, characterListQuery };
