import { Event, sample } from 'effector';

import { Query } from '../../query/type';
import { RemoteOperationParams } from '../../remote_operation/type';
import { sha1 } from '../lib/hash';

export function enrichStartWithKey<Q extends Query<any, any, any>>(
  query: Q
): Event<{ params: RemoteOperationParams<Q>; key: string }> {
  const queryDataSid = querySid(query);

  return sample({
    clock: query.start,
    source: query.__.sources,
    fn: (sources, params) => ({
      params,
      key: createKey({ sid: queryDataSid, params, sources }),
    }),
  });
}

function createKey({
  sid,
  params,
  sources,
}: {
  sid: string;
  params: unknown;
  sources: unknown[];
}): string {
  return sha1(sid + JSON.stringify(params) + JSON.stringify(sources));
}

function querySid(query: Query<any, any, any>) {
  const sid = query.$data.sid;

  if (!sid?.includes('|')) {
    // TODO: throw something
    throw new Error('HMMM');
  }

  return sid;
}
