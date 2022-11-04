import {
  createJsonQuery,
  declareParams,
  exponentialDelay,
  retry,
} from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array, Record } from 'runtypes';

import {
  Character,
  characterListRoute,
  characterUrl,
} from '../../entities/character';
import { rootDomain } from '../../shared/domain';
import { Info } from '../../shared/info';

const characterListQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    url: characterUrl(),
    query: ({ page }) => ({ page }),
    method: 'GET',
  },
  response: {
    contract: runtypeContract(
      Record({ info: Info, results: Array(Character) })
    ),
  },
  domain: rootDomain,
  name: 'characterListQuery',
});

retry(characterListQuery, { times: 3, delay: exponentialDelay(50) });

const $currentPage = characterListRoute.$params.map(
  (params) => params.page ?? 1
);

sample({
  clock: [characterListRoute.opened, characterListRoute.updated],
  source: { page: $currentPage },
  target: characterListQuery.start,
});

export { $currentPage, characterListQuery };
