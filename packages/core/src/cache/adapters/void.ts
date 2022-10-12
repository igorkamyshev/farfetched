import { createEffect } from 'effector';

import { createAdapter } from './instance';
import { CacheAdapter } from './type';

export function voidCache(): CacheAdapter {
  return createAdapter({
    get: createEffect<{ key: string }, string | null>(() => null),
    set: createEffect<{ key: string; value: string }, void>(() => {
      // pass
    }),
  });
}