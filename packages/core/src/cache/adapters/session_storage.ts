import { browserStorageCache } from './browser_storage';
import { CacheAdapter, CacheAdapterOptions } from './type';

export function sessionStorageCache(
  config?: CacheAdapterOptions
): CacheAdapter {
  return browserStorageCache({
    storage: sessionStorage,
    ...config,
  });
}
