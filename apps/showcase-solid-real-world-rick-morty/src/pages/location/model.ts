import { connectQuery } from '@farfetched/core';
import { sample } from 'effector';

import { createCharacterListQuery } from '../../entities/character';
import { createLocationQuery, locationRoute } from '../../entities/location';
import { urlToId } from '../../shared/id';

export const currentLocationQuery = createLocationQuery({
  mapParams: ({ locationId }: { locationId: number }) => ({ id: locationId }),
});
export const residentsQuery = createCharacterListQuery({
  mapParams: (urls: string[]) => ({ ids: urls.map(urlToId) }),
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
