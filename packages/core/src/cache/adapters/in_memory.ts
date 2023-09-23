import { createEffect, createEvent, sample, scopeBind } from 'effector';

import { time } from '../../libs/patronus';
import { parseTime } from '../../libs/date-nfs';
import { createCacheAdapter } from './instance';
import { attachObservability } from './observability';
import { CacheAdapter, CacheAdapterOptions } from './type';

type Entry = { value: unknown; cachedAt: number };
type Storage = Record<string, Entry>;

export function inMemoryCache(config?: CacheAdapterOptions): CacheAdapter {
  const { maxEntries, maxAge, observability } = config ?? {};

  let storage: Storage = {};

  const saveValue = createEvent<{ key: string; value: unknown }>();
  const removeValue = createEvent<{ key: string }>();

  const itemExpired = createEvent<{ key: string; value: unknown }>();
  const itemEvicted = createEvent<{ key: string }>();

  const purge = createEvent();

  purge.watch(() => {
    storage = {};
  });

  const $now = time({ clock: saveValue });

  const maxEntriesApplied = sample({
    clock: saveValue,
    source: { now: $now },
    fn: ({ now }, { key, value }) =>
      applyMaxEntries(
        storage,
        { key, entry: { value, cachedAt: now } },
        maxEntries
      ),
  });

  maxEntriesApplied.watch(({ next }) => {
    storage = next;
  });

  sample({
    clock: maxEntriesApplied,
    filter: ({ evicted }) => !!evicted,
    fn: ({ evicted }) => ({ key: evicted! }),
    target: itemEvicted,
  });

  removeValue.watch(({ key }) => {
    const { [key]: _, ...rest } = storage;

    storage = rest;
  });

  if (maxAge) {
    const timeout = parseTime(maxAge);

    saveValue.watch((payload) => {
      const boundItemExpired = scopeBind(itemExpired, { safe: true });

      setTimeout(() => boundItemExpired(payload), timeout);
    });

    sample({
      clock: itemExpired,
      fn: ({ key }) => ({ key }),
      target: removeValue,
    });
  }

  const adapter = {
    get: createEffect(({ key }: { key: string }): Entry | null => {
      const saved = storage[key] ?? null;

      if(config?.debug){
        console.log('[inMemoryAdapter.get] saved',saved, storage, key)
      }

      if (!saved) {
        return null;
      }

      if (maxAge) {
        const expiredAt = saved?.cachedAt + parseTime(maxAge);

        if (Date.now() >= expiredAt) {
          removeValue({ key });
          return null;
        }
      }

      return saved;
    }),
    set: createEffect<
      {
        key: string;
        value: unknown;
      },
      void
    >(saveValue),
    unset: createEffect<{ key: string }, void>(removeValue),
    purge,
  };

  attachObservability({
    adapter,
    options: observability,
    events: { itemExpired, itemEvicted },
  });

  return createCacheAdapter(adapter);
}

function applyMaxEntries(
  storage: Storage,
  { key, entry }: { key: string; entry: Entry },
  maxEntries?: number
): { next: Storage; evicted: string | null } {
  if (maxEntries === undefined)
    return { next: { ...storage, [key]: entry }, evicted: null };

  const keys = Object.keys(storage);
  if (keys.length < maxEntries)
    return { next: { ...storage, [key]: entry }, evicted: null };

  const [firstKey] = keys;
  const { [firstKey]: _, ...rest } = storage;
  return { next: { ...rest, [key]: entry }, evicted: firstKey };
}
