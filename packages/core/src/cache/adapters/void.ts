import { createEffect, createEvent } from 'effector';

import { createAdapter } from './instance';
import { CacheAdapter } from './type';

export function voidCache(): CacheAdapter {
  return createAdapter({
    get: createEffect<
      { key: string },
      { value: unknown; cachedAt: number } | null
    >(() => null),
    set: createEffect<{ key: string; value: unknown }, void>(() => {
      // pass
    }),
    purge: createEvent(),
  });
}
