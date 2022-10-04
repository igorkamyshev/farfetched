import { Effect, Event } from 'effector';

import { Time } from '../lib/time';

export interface CacheAdapter {
  get: Effect<{ key: string }, string | null>;
  set: Effect<{ key: string; value: string }, void>;
}

export interface CacheAdapterOptions {
  maxEntries?: number;
  maxAge?: Time;
  observability?: { keyFound?: Event<{ key: string }> };
}
