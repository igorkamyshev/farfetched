import { Effect, Event, Store } from 'effector';

import { Time } from '../lib/time';

export interface CacheAdapterInstance {
  get: Effect<{ key: string }, string | null>;
  set: Effect<{ key: string; value: string }, void>;
}

export interface CacheAdapterOptions {
  maxEntries?: number;
  maxAge?: Time;
  observability?: { keyFound?: Event<{ key: string }> };
}

export interface CacheAdapter extends CacheAdapterInstance {
  // To support Fork API adapter should be used only thru $instance
  __: { $instance: Store<CacheAdapterInstance> };
}