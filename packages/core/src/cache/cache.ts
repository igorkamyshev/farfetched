import {
  attach,
  combine,
  createEffect,
  Effect,
  Event,
  merge,
  sample,
  split,
} from 'effector';

import { parseTime, type Time } from '../libs/date-nfs';
import {
  type RemoteOperationParams,
  type RemoteOperationResult,
} from '../remote_operation/type';
import { type Query } from '../query/type';
import { inMemoryCache } from './adapters/in_memory';
import { type CacheAdapter, type CacheAdapterInstance } from './adapters/type';
import {
  createKey,
  enrichFinishedSuccessWithKey,
  enrichForcedWithKey,
  queryUniqId,
} from './key/key';

interface CacheParameters {
  adapter?: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
}

interface CacheParametersDefaulted {
  adapter: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
}

export function cache<Q extends Query<any, any, any, any>>(
  query: Q,
  params?: CacheParameters
): void {
  // query.__.lowLevelAPI.registerInterruption();

  const defaultedParams: CacheParametersDefaulted = {
    adapter: params?.adapter ?? inMemoryCache(),
    ...params,
  };

  removeFromCache(query, defaultedParams);
  saveToCache(query, defaultedParams);
  pickFromCache(query, defaultedParams);
}

function removeFromCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter, purge }: CacheParametersDefaulted
) {
  if (purge) {
    const purgeCachedValuesFx = createEffect(
      ({ instance }: { instance: CacheAdapterInstance }) => instance.purge()
    );

    sample({
      clock: purge,
      source: { instance: adapter.__.$instance },
      target: purgeCachedValuesFx,
    });
  }

  const unsetCachedValueFx = createEffect(
    ({ instance, key }: { instance: CacheAdapterInstance; key: string }) =>
      instance.unset({ key })
  );

  const { forcedWithKey } = split(enrichForcedWithKey(query), {
    forcedWithKey: (
      p
    ): p is {
      params: RemoteOperationParams<Q>;
      key: string;
    } => p.key !== null,
  });

  sample({
    clock: forcedWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key }) => ({ instance, key }),
    target: unsetCachedValueFx,
  });
}

function saveToCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter }: CacheParametersDefaulted
) {
  const putCachedValueFx = createEffect(
    ({
      instance,
      key,
      value,
    }: {
      instance: CacheAdapterInstance;
      key: string;
      value: unknown;
    }) => instance.set({ key, value })
  );

  // TODO: allow to subscribe on __ to log invalid key error
  const { doneWithKey } = split(enrichFinishedSuccessWithKey(query), {
    doneWithKey: (
      p
    ): p is {
      params: RemoteOperationParams<Q>;
      result: RemoteOperationResult<Q>;
      key: string;
    } => p.key !== null,
  });

  sample({
    clock: doneWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key, result }) => ({
      instance,
      key,
      value: result,
    }),
    target: putCachedValueFx,
  });
}

function pickFromCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter, staleAfter }: CacheParametersDefaulted
) {
  const anyStart = merge([query.start, query.refresh]);

  const getFromCacheFx: Effect<
    any,
    { result: unknown; stale: boolean } | null,
    any
  > = attach({
    source: {
      instance: adapter.__.$instance,
      sources: combine(
        query.__.lowLevelAPI.sourced.map((sourced) => sourced(anyStart))
      ),
    },
    async effect({ instance, sources }, params: unknown) {
      const key = createKey({
        sid: queryUniqId(query),
        params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
        sources,
      });

      if (!key) {
        return null;
      }

      const result = await instance.get({ key });

      if (!result) {
        return null;
      }

      const stale = staleAfter
        ? result.cachedAt + parseTime(staleAfter!) <= Date.now()
        : true;

      return { result: result.value, stale };
    },
  });

  query.__.lowLevelAPI.dataSources.unshift({
    name: 'cache',
    get: getFromCacheFx,
  });
}
