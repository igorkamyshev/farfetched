import { createStore } from 'effector';

import { CacheAdapter, CacheAdapterInstance } from './type';

export function createCacheAdapter(
  adapter: CacheAdapterInstance
): CacheAdapter {
  const $instance = createStore(adapter, {
    serialize: 'ignore',
    name: 'ff.$cacheInstance',
    sid: 'ff.$cacheInstance',
  });

  return { ...adapter, __: { $instance } };
}
