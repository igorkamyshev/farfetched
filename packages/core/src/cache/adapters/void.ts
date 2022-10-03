import { createEffect } from 'effector';
import { CacheAdapter } from './type';

export function voidCache(): CacheAdapter {
  return {
    get: createEffect<{ key: string }, string | null>(() => null),
    set: createEffect<{ key: string; value: string }, void>(() => {
      // pass
    }),
  };
}
