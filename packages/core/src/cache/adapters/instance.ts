import { createStore } from 'effector';

import { CacheAdapter, CacheAdapterInstance } from './type';

export function createCacheAdapter(
  adapter: CacheAdapterInstance
): CacheAdapter {
  const $instance = createStore(adapter, {
    serialize: 'ignore',
    sid: 'ff.cache_instance',
  });

  return { ...adapter, __: { $instance } };
}
