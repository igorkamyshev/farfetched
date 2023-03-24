import { createStore } from 'effector';

import { CacheAdapter, CacheAdapterInstance } from './type';

export function createAdapter(
  adapter: CacheAdapterInstance,
  opts?: { name: string }
): CacheAdapter {
  const $instance = createStore(adapter, {
    serialize: 'ignore',
    sid: 'ff.cache_instance',
  });

  return { ...adapter, name: adapter.name ?? opts?.name, __: { $instance } };
}
