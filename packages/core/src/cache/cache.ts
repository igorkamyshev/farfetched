import { createEffect, createEvent, sample } from 'effector';

import { Query } from '../query/type';
import { RemoteOperationParams } from '../remote_operation/type';
import { CacheAdapter, CacheAdapterInstance } from './adapters/type';
import { enrichFinishedSuccessWithKey, enrichStartWithKey } from './key/key';

interface CacheParameters {
  adapter: CacheAdapter;
}

export function cache<Q extends Query<any, any, any>>(
  query: Q,
  params: CacheParameters
): void {
  saveToCache(query, params);
  pickFromCache(query, params);
}

function saveToCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter }: CacheParameters
) {
  const putCachedValueFx = createEffect(
    ({
      instance,
      key,
      value,
    }: {
      instance: CacheAdapterInstance;
      key: string;
      value: string;
    }) => instance.set({ key, value })
  );
  const doneWithKey = enrichFinishedSuccessWithKey(query);

  sample({
    clock: doneWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key, data }) => ({
      instance,
      key,
      // TODO: store serizalizer in adapter to prevent serialization in inMempory adapter
      value: JSON.stringify(data),
    }),
    target: putCachedValueFx,
  });
}

function pickFromCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter }: CacheParameters
) {
  const pickCachedValueFx = createEffect(
    ({
      instance,
      key,
    }: {
      instance: CacheAdapterInstance;
      key: string;
      params: RemoteOperationParams<Q>;
    }) => instance.get({ key })
  );
  const cachedValueFound = createEvent<{
    params: RemoteOperationParams<Q>;
    data: unknown;
  }>();
  const startWithKey = enrichStartWithKey(query);

  sample({
    clock: startWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key, params }) => ({ instance, key, params }),
    target: pickCachedValueFx,
  });

  sample({
    clock: pickCachedValueFx.done,
    filter: ({ result }) => Boolean(result),
    fn: ({ result, params }) => ({
      // TODO: store serizalizer in adapter to prevent serialization in inMempory adapter
      data: JSON.parse(result!.value),
      params: params.params,
    }),
    target: cachedValueFound,
  });

  // TODO: push to internal state because of contract and validation apply
  sample({
    clock: cachedValueFound,
    fn: ({ data }) => data,
    target: query.$data,
  });

  sample({
    clock: cachedValueFound,
    fn: () => true,
    target: query.$stale,
  });
}
