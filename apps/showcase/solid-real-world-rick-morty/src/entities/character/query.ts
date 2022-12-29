import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { TId } from '../../shared/id';
import { Info } from '../../shared/info';
import { characterUrl } from './api';
import { Character } from './contract';

export const characterQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => characterUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Character) },
});

export const characterListQuery = createJsonQuery({
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: ({ ids }) => characterUrl({ ids }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Character)) },
});

export const characterPageQuery = createJsonQuery({
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
});
