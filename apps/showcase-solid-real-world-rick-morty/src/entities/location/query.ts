import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';

import { locationUrl } from './api';
import { Location } from './contract';

export function createLocationQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { id: number };
}) {
  const q = createJsonQuery({
    params: declareParams<T>(),
    request: { url: (params) => locationUrl(mapParams(params)), method: 'GET' },
    response: { contract: Location },
  });

  concurrency(q, { strategy: 'TAKE_LATEST' });

  return q;
}
