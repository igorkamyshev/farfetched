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

  sample({
    clock: saveValue,
    source: $storage,
    fn: (storage, { key, value }) =>
      applyMaxEntries(storage, { key, value }, maxEntries),
    target: $storage,
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
    sample({
      clock: delay({ source: saveValue, timeout: parseTime(maxAge) }),
      target: removeValue,
    });
  }

  const getFx = attach({
    source: $storage,
    mapParams: ({ key }: { key: string }, storage) => storage[key] ?? null,
    effect: createEffect((t: string | null) => t),
  });

  if (observability?.keyFound) {
    sample({
      clock: getFx.done,
      filter: ({ result }) => result !== null,
      fn: ({ params }) => ({ key: params.key }),
      target: observability.keyFound,
    });
  }

  return createAdapter({
    get: getFx,
    set: createEffect<
      {
        key: string;
        value: string;
      },
      void
    >(saveValue),
  });
}

function applyMaxEntries(
  storage: Storage,
  { key, value }: { key: string; value: string },
  maxEntries?: number
): Storage {
  if (maxEntries === undefined) return { ...storage, [key]: value };

  const keys = Object.keys(storage);
  if (keys.length < maxEntries) return { ...storage, [key]: value };

  const [firstKey] = keys;
  const { [firstKey]: _, ...rest } = storage;
  return { ...rest, [key]: value };
}
