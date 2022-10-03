import { Time } from '../lib/time';
import { browserStorageCache } from './browser_storage';
import { CacheAdapter } from './type';

export function sessionStorageCache(config?: {
  maxEntries?: number;
  maxAge?: Time;
}): CacheAdapter {
  const { maxEntries, maxAge } = config ?? {};

  return browserStorageCache({
    storage: sessionStorage,
    maxEntries,
    maxAge,
  });
}
