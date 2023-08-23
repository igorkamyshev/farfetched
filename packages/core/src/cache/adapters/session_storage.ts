import { browserStorageCache, SerializeConfig } from './browser_storage';
import { CacheAdapter, CacheAdapterOptions } from './type';

export function sessionStorageCache(
  config?: CacheAdapterOptions & SerializeConfig
): CacheAdapter {
  return browserStorageCache({
    storage: () => sessionStorage,
    ...config,
  });
}
