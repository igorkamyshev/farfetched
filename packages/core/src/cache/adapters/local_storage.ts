import { browserStorageCache } from './browser_storage';
import { CacheAdapter, CacheAdapterOptions } from './type';

export function localStorageCache(config?: CacheAdapterOptions): CacheAdapter {
  return browserStorageCache({
    storage: () => localStorage,
    name: 'localStorageCache',
    ...config,
  });
}
