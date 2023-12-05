import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';

import { TId } from '../../shared/id';
import { locationUrl } from './api';
import { Location } from './contract';

export function createLocationQuery<T>({
  mapParams,
}: {
  mapParams: (params: T) => { id: TId };
}) {
  return createJsonQuery({
    params: declareParams<T>(),
    request: { url: (params) => locationUrl(mapParams(params)), method: 'GET' },
    response: { contract: runtypeContract(Location) },
  });
}
