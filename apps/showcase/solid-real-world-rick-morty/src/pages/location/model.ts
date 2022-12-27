import { attachOperation, connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { characterListQuery } from '../../entities/character';
import { locationQuery, locationRoute } from '../../entities/location';
import { urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const currentLocationQuery = attachOperation(locationQuery);
const residentsQuery = attachOperation(characterListQuery, {
  mapParams: (urls: TUrl[]) => ({ ids: urls.map(urlToId) }),
});

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
    return { params: location.residents };
  },
  target: residentsQuery,
});

export { currentLocationQuery, residentsQuery };
