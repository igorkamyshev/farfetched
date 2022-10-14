import { createEffect, createEvent, sample } from 'effector';

import { Query } from '../query/type';
import { CacheAdapter, CacheAdapterInstance } from './adapters/type';
import { enrichStartWithKey } from './key/key';

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
  // pass
}

function pickFromCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter }: CacheParameters
) {
  const pickCachedValueFx = createEffect(
    ({ instance, key }: { instance: CacheAdapterInstance; key: string }) =>
      instance.get({ key })
  );
  const cachedValueFound = createEvent<string>();
  const startWithKey = enrichStartWithKey(query);

  sample({
    clock: startWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key }) => ({ instance, key }),
    target: pickCachedValueFx,
  });

  sample({
    clock: pickCachedValueFx.doneData,
    filter: Boolean,
    fn: ({ value }) => value,
    target: cachedValueFound,
  });
}
