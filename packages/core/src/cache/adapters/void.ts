import { createEffect, createEvent } from 'effector';

import { createCacheAdapter } from './instance';
import { CacheAdapter } from './type';

export function voidCache(): CacheAdapter {
  return createCacheAdapter(
    {
      get: createEffect<
        { key: string },
        { value: unknown; cachedAt: number } | null
      >(() => null),
      set: createEffect<{ key: string; value: unknown }, void>(() => {
        // pass
      }),
      purge: createEvent(),
      unset: createEffect<{ key: string }, void>(),
    },
    { name: 'voidCache' }
  );
}
