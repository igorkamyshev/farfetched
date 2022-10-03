import { Time } from '../lib/time';
import { browserStorageCache } from './browser_storage';
import { CacheAdapter } from './type';

// -- adapter

export function localStorageCache(config?: {
  maxEntries?: number;
  maxAge?: Time;
}): CacheAdapter {
  const { maxEntries, maxAge } = config ?? {};

  return browserStorageCache({ storage: localStorage, maxEntries, maxAge });
}
