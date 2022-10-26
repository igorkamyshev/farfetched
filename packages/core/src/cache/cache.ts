import { createEffect, createEvent, sample, split } from 'effector';

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
  query.__.cmd.registerInterruption();

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

  const { found, __: notFound } = split(pickCachedValueFx.done, {
    found: ({ result }) => Boolean(result),
  });

  sample({
    clock: found,
    fn: ({ result, params }) => ({
      // TODO: store serizalizer in adapter to prevent serialization in inMempory adapter
      data: JSON.parse(result!.value),
      params: params.params,
    }),
    target: cachedValueFound,
  });

  sample({
    clock: cachedValueFound,
    fn: ({ data, params }) => ({ params, result: data, stopPropagation: true }),
    target: query.__.cmd.fillData,
  });

  // TODO: do not resume for non-stale case
  sample({
    clock: [found, notFound],
    fn: ({ params }) => params,
    target: query.__.cmd.resumeExecution,
  });
}
