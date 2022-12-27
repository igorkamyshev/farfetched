import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterListQuery } from '../../entities/character';
import { locationQuery, locationRoute } from '../../entities/location';
import { urlToId } from '../../shared/id';

const currentLocationQuery = attachOperation(locationQuery);

const residentsQuery = attachOperation(characterListQuery);

sample({
  clock: locationRoute.opened,
  fn({ params }) {
    return { id: params.locationId };
  },
  target: currentLocationQuery.start,
});

connectQuery({
  source: currentLocationQuery,
  fn({ result: location }) {
    return { params: { ids: location.residents.map(urlToId) } };
  },
  target: residentsQuery,
});

export { currentLocationQuery, residentsQuery };
