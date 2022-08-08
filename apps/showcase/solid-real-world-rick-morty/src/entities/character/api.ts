import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Record } from 'runtypes';

import { Info } from '../../shared/info';

import { Location } from '../location';
import { Character } from './model';

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

const characterQuery = createJsonQuery({
  params: declareParams<{ characterId: number }>(),
  request: {
    url: ({ characterId }) =>
      `https://rickandmortyapi.com/api/character/${characterId}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Character) },
});

const originQuery = createJsonQuery({
  params: declareParams<{ locationUrl: string }>(),
  request: { url: ({ locationUrl }) => locationUrl, method: 'GET' },
  response: { contract: runtypeContract(Location) },
});

connectQuery({
  source: { character: characterQuery },
  fn({ character }) {
    return { locationUrl: character.origin.url };
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

export {
  characterListQuery,
  characterQuery,
  originQuery,
  currentLocationQuery,
};
