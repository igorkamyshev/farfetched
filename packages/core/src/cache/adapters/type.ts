import { Effect } from 'effector';

export interface CacheAdapter {
  get: Effect<{ key: string }, string | null>;
  set: Effect<{ key: string; value: string }, void>;
}
