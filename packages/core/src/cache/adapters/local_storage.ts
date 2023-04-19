import { browserStorageCache, SerializeConfig } from './browser_storage';
import { CacheAdapter, CacheAdapterOptions } from './type';

export function localStorageCache(
  config?: CacheAdapterOptions & SerializeConfig
): CacheAdapter {
  return browserStorageCache({ storage: () => localStorage, ...config });
}
