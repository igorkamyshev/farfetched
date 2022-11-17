import { Effect, Event, Store } from 'effector';

import { Time } from '../../misc/time';

export interface CacheAdapterInstance {
  get: Effect<{ key: string }, { value: unknown; cachedAt: number } | null>;
  set: Effect<{ key: string; value: unknown }, void>;
  purge: Event<void>;
}

export interface CacheAdapterOptions {
  maxEntries?: number;
  maxAge?: Time;
  observability?: {
    hit?: Event<{ key: string }>;
    miss?: Event<{ key: string }>;
    expired?: Event<{ key: string }>;
    evicted?: Event<{ key: string }>;
  };
}

export interface CacheAdapter extends CacheAdapterInstance {
  // To support Fork API adapter should be used only thru $instance
  __: { $instance: Store<CacheAdapterInstance> };
}
