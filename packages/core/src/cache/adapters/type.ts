import type { Effect, Event, EventCallable, Store } from 'effector';

import { Time } from '../../libs/date-nfs';

export interface CacheAdapterInstance {
  get: Effect<{ key: string }, { value: unknown; cachedAt: number } | null>;
  set: Effect<{ key: string; value: unknown }, void>;
  purge: EventCallable<void>;
  unset: Effect<{ key: string }, void>;
}

export interface CacheAdapterOptions {
  maxEntries?: number;
  maxAge?: Time;
  observability?: {
    hit?: EventCallable<{ key: string }>;
    miss?: EventCallable<{ key: string }>;
    expired?: EventCallable<{ key: string }>;
    evicted?: EventCallable<{ key: string }>;
  };
}

export interface CacheAdapter extends CacheAdapterInstance {
  // To support Fork API adapter should be used only thru $instance
  __: { $instance: Store<CacheAdapterInstance> };
}
