import { CacheAdapter } from './type';

export function voidCache(): CacheAdapter {
  return {
    get: async () => null,
    set: async () => {
      // pass
    },
  };
}
