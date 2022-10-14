import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
} from 'effector';
import { delay } from 'patronum';

import { parseTime } from '../lib/time';
import { createAdapter } from './instance';
import { attachObservability } from './observability';
import { CacheAdapter, CacheAdapterOptions } from './type';

type Storage = Record<string, string>;

export function inMemoryCache(config?: CacheAdapterOptions): CacheAdapter {
  const { maxEntries, maxAge, observability } = config ?? {};

  const $storage = createStore<Storage>(
    {},
    {
      serialize: 'ignore',
    }
  );

  const saveValue = createEvent<{ key: string; value: string }>();
  const removeValue = createEvent<{ key: string }>();

  const itemExpired = createEvent<{ key: string; value: string }>();
  const itemEvicted = createEvent<{ key: string }>();

  const maxEntriesApplied = sample({
    clock: saveValue,
    source: $storage,
    fn: (storage, { key, value }) =>
      applyMaxEntries(storage, { key, value }, maxEntries),
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
      source: saveValue,
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
      mapParams: ({ key }: { key: string }, storage) => storage[key] ?? null,
      effect: createEffect((value: string | null) => {
        if (value === null) return null;

        return {
          value,
        };
      }),
    }),
    set: createEffect<
      {
        key: string;
        value: string;
      },
      void
    >(saveValue),
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
  { key, value }: { key: string; value: string },
  maxEntries?: number
): { next: Storage; evicted: string | null } {
  if (maxEntries === undefined)
    return { next: { ...storage, [key]: value }, evicted: null };

  const keys = Object.keys(storage);
  if (keys.length < maxEntries)
    return { next: { ...storage, [key]: value }, evicted: null };

  const [firstKey] = keys;
  const { [firstKey]: _, ...rest } = storage;
  return { next: { ...rest, [key]: value }, evicted: firstKey };
}
