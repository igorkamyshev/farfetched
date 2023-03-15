import { Event, sample } from 'effector';

import { get } from '../../libs/lohyphen';
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
  return enrichWithKey(query.__.lowLevelAPI.validatedSuccessfully, query);
}

export function enrichStartWithKey<Q extends Query<any, any, any>>(
  query: Q
): Event<{ params: RemoteOperationParams<Q>; key: string | null }> {
  return enrichWithKey(
    query.start.map((params) => ({ params })),
    query
  );
}

export function enrichForcedWithKey<Q extends Query<any, any, any>>(
  query: Q
): Event<{ params: RemoteOperationParams<Q>; key: string | null }> {
  return enrichWithKey(query.__.lowLevelAPI.forced, query);
}

function enrichWithKey<
  T extends { params: any },
  Q extends Query<any, any, any>
>(event: Event<T>, query: Q): Event<T & { key: string | null }> {
  const queryDataSid = queryUniqId(query);

  const source = query.__.lowLevelAPI.sourced.map((sourced) =>
    sourced(event.map(get('params')))
  );

  return sample({
    clock: event,
    source,
    fn: (sources, payload) => ({
      ...payload,
      key: createKey({
        sid: queryDataSid,
        params: query.__.lowLevelAPI.paramsAreMeaningless
          ? null
          : payload.params,
        sources,
      }),
    }),
  });
}

export function createKey({
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

export function queryUniqId(query: Query<any, any, any>) {
  const sid = querySid(query);

  if (sid) {
    return sid;
  }

  const uniqName = queryUniqName(query);

  if (uniqName) {
    return uniqName;
  }

  throw new Error(
    'Query does not have sid or uniq name, which is required for caching, read more https://farfetched.pages.dev/recipes/sids.html'
  );
}

function querySid(query: Query<any, any, any>): string | null {
  const sid = query.$data.sid;

  if (!sid?.includes('|')) {
    return null;
  }

  return sid;
}

const prevNames = new Set<string>();
function queryUniqName(query: Query<any, any, any>): string | null {
  const name = query.__.meta.name;

  if (prevNames.has(name)) {
    return null;
  }

  prevNames.add(name);
  return name;
}
