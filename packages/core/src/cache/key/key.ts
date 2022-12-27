import { Event, sample } from 'effector';

import { Query } from '../../query/type';
import {
  RemoteOperationResult,
  RemoteOperationParams,
} from '../../remote_operation/type';
import { sha1 } from '../lib/hash';
import { stableStringify } from '../lib/stable_stringify';

export function enrichFinishedSuccessWithKey<Q extends Query<any, any, any>>(
  query: Q
): Event<{
  params: RemoteOperationParams<Q>;
  result: RemoteOperationResult<Q>;
  key: string | null;
}> {
  const queryDataSid = querySid(query);

  return sample({
    clock: query.__.lowLevelAPI.validatedSuccessfully,
    source: query.__.lowLevelAPI.sources,
    fn: (sources, { params, result }) => ({
      params,
      result,
      key: createKey({ sid: queryDataSid, params, sources }),
    }),
  });
}

export function enrichStartWithKey<Q extends Query<any, any, any>>(
  query: Q
): Event<{ params: RemoteOperationParams<Q>; key: string | null }> {
  const queryDataSid = querySid(query);

  return sample({
    clock: query.start,
    source: query.__.lowLevelAPI.sources,
    fn: (sources, params) => ({
      params,
      key: createKey({ sid: queryDataSid, params, sources }),
    }),
  });
}

function createKey({
  sid,
  params = null,
  sources,
}: {
  sid: string;
  params: unknown;
  sources: unknown[];
}): string | null {
  try {
    const stableString = stableStringify({ params, sources, sid })!;

    return sha1(stableString);
  } catch (e: unknown) {
    return null;
  }
}

function querySid(query: Query<any, any, any>) {
  const sid = query.$data.sid;

  if (!sid?.includes('|')) {
    throw new Error(
      'Query does not have sid, which is required for caching, read more https://farfetched.pages.dev/recipes/sids.html'
    );
  }

  return sid;
}
