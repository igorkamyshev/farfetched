import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';

import { TId } from '../../shared/id';
import { locationUrl } from './api';
import { Location } from './contract';

export const locationQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: { url: ({ id }) => locationUrl({ id }), method: 'GET' },
  response: { contract: runtypeContract(Location) },
});
