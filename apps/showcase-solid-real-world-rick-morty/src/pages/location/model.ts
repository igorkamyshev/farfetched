import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterListQuery } from '../../entities/character';
import { createLocationQuery, locationRoute } from '../../entities/location';
import { TId, urlToId } from '../../shared/id';
import { TUrl } from '../../shared/url';

const currentLocationQuery = createLocationQuery({
  mapParams: ({ locationId }: { locationId: TId }) => ({ id: locationId }),
});
const residentsQuery = createCharacterListQuery({
  mapParams: (urls: TUrl[]) => ({ ids: urls.map(urlToId) }),
});

sample({
  clock: locationRoute.opened,
  fn({ params }) {
    return params;
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
