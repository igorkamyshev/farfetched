import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';

import { Location } from './model';

const locationQuery = createJsonQuery({
  params: declareParams<{ locationId: number }>(),
  request: {
    url: ({ locationId }) =>
      `https://rickandmortyapi.com/api/location/${locationId}`,
    method: 'GET',
  },
  response: { contract: runtypeContract(Location) },
});

export { locationQuery };
