import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import { Character } from '../../entities/character';
import { Location, locationRoute } from '../../entities/location';
import { urlToId } from '../../shared/id';

const locationQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    url: ({ id }) => `https://rickandmortyapi.com/api/location/${id}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Location) },
});

const residentsQuery = createJsonQuery({
  params: declareParams<{ ids: number[] }>(),
  request: {
    url: ({ ids }) =>
      `https://rickandmortyapi.com/api/character/${ids.join(',')}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Array(Character)) },
});

sample({
  clock: locationRoute.opened,
  fn({ params }) {
    return { id: params.locationId };
  },
  target: locationQuery.start,
});

connectQuery({
  source: { location: locationQuery },
  fn({ location }) {
    return { ids: location.residents.map(urlToId) };
  },
  target: residentsQuery,
});

export { locationQuery, residentsQuery };
