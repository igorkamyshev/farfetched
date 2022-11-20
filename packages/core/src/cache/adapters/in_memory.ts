import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
} from 'effector';

import { time } from '../../libs/patronus/time';
import { delay } from '../../libs/patronus/delay';
import { parseTime } from '../../libs/date-nfs/time';
import { createAdapter } from './instance';
import { attachObservability } from './observability';
import { CacheAdapter, CacheAdapterOptions } from './type';

type Entry = { value: unknown; cachedAt: number };
type Storage = Record<string, Entry>;

// TODO: save time to prevent stale data because of throttling
export function inMemoryCache(config?: CacheAdapterOptions): CacheAdapter {
  const { maxEntries, maxAge, observability } = config ?? {};

  const $storage = createStore<Storage>(
    {},
    {
      serialize: 'ignore',
    }
  );

  const saveValue = createEvent<{ key: string; value: unknown }>();
  const removeValue = createEvent<{ key: string }>();

  const itemExpired = createEvent<{ key: string; value: unknown }>();
  const itemEvicted = createEvent<{ key: string }>();

  const purge = createEvent();

  $storage.reset(purge);

  const $now = time({ clock: saveValue });

  const maxEntriesApplied = sample({
    clock: saveValue,
    source: { storage: $storage, now: $now },
    fn: ({ storage, now }, { key, value }) =>
      applyMaxEntries(
        storage,
        { key, entry: { value, cachedAt: now } },
        maxEntries
      ),
  });

  sample({
    source: maxEntriesApplied,
    fn: ({ next }) => next,
    target: $storage,
  });

  sample({
    clock: maxEntriesApplied,
    filter: ({ evicted }) => !!evicted,
    fn: ({ evicted }) => ({ key: evicted! }),
    target: itemEvicted,
  });

  sample({
    clock: removeValue,
    source: $storage,
    fn: (storage, { key }) => {
      const { [key]: _, ...rest } = storage;

      return rest;
    },
    target: $storage,
  });

  if (maxAge) {
    delay({
      clock: saveValue,
      timeout: parseTime(maxAge),
      target: itemExpired,
    });

    sample({
      clock: itemExpired,
      fn: ({ key }) => ({ key }),
      target: removeValue,
    });
  }

  const adapter = {
    get: attach({
      source: $storage,
      effect: (storage, { key }: { key: string }): Entry | null => {
        const saved = storage[key] ?? null;

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
      },
    }),
    set: createEffect<
      {
        key: string;
        value: unknown;
      },
      void
    >(saveValue),
    purge,
  };

  attachObservability({
    adapter,
    options: observability,
    events: { itemExpired, itemEvicted },
  });

  return createAdapter(adapter);
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
