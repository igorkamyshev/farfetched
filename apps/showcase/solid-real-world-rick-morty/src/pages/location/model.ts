import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { sample } from 'effector';
import { Array } from 'runtypes';

import { Character, characterUrl } from '../../entities/character';
import { Location, locationRoute, locationUrl } from '../../entities/location';
import { TId, urlToId } from '../../shared/id';
import { domain } from '../../shared/domain';

const locationQuery = createJsonQuery({
  domain,
  name: 'Location',
  params: declareParams<{ id: TId }>(),
  request: {
    url: ({ id }) => locationUrl({ id }),
    method: 'GET',
  },
  response: { contract: runtypeContract(Location) },
});

const residentsQuery = createJsonQuery({
  domain,
  name: 'Residents',
  params: declareParams<{ ids: TId[] }>(),
  request: {
    url: ({ ids }) => characterUrl({ ids }),
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
