import {
  createEffect,
  createEvent,
  createStore,
  type Json,
  sample,
} from 'effector';

import { delay } from '../../libs/patronus';
import { parseTime } from '../../libs/date-nfs';
import { createCacheAdapter } from './instance';
import { attachObservability } from './observability';
import { type CacheAdapter, type CacheAdapterOptions } from './type';
import { get } from '../../libs/lohyphen';

export const META_KEY = '__farfetched_meta__';

export type SerializeConfig = {
  serialize?: {
    read: (value: Json) => unknown;
    write: (value: unknown) => Json;
  };
};

export function browserStorageCache(
  config: {
    storage: () => Storage;
  } & CacheAdapterOptions &
    SerializeConfig
): CacheAdapter {
  const { storage, observability, maxAge, maxEntries, serialize } = config;

  // -- adapter
  function storageCache(): CacheAdapter {
    const getSavedItemFx = createEffect(async (key: string) => {
      const item = await getItemFx(key);

      if (!item) return null;

      try {
        const parsed = JSON.parse(item);

        return {
          ...parsed,
          value: serialize?.read ? serialize.read(parsed.value) : parsed.value,
        } as SavedItem;
      } catch {
        return null;
      }
    });

    const setSavedItemFx = createEffect(
      async ({ key, value }: { key: string; value: unknown }) => {
        const item = JSON.stringify({
          value: serialize?.write ? serialize.write(value) : value,
          timestamp: Date.now(),
        });

        metaStorage.addKey({ key });

        await setItemFx({ key, value: item });
      }
    );

    const removeSavedItemFx = createEffect(async (key: string) => {
      metaStorage.removeKey({ key });
      await removeItemFx(key);
    });

    const itemExpired = createEvent<{ key: string; value: unknown }>();
    const itemEvicted = createEvent<{ key: string }>();

    const purge = createEvent();
    const purgeFx = createEffect(async (keys: string[]) =>
      Promise.all(keys.map(removeSavedItemFx))
    );

    sample({
      clock: purge,
      source: metaStorage.$meta,
      fn: (meta) => meta?.keys ?? [],
      target: purgeFx,
    });

    if (maxAge) {
      sample({
        clock: delay({
          clock: sample({
            clock: setItemFx.done,
            filter: ({ params }) => params.key !== META_KEY,
          }),
          timeout: parseTime(maxAge),
        }),
        fn: get('params'),
        target: [itemExpired, removeSavedItemFx],
      });
    }

    const adapter = {
      get: createEffect<
        { key: string },
        { value: unknown; cachedAt: number } | null
      >(async ({ key }) => {
        const saved = await getSavedItemFx(key);

        if (!saved) return null;

        if (maxAge) {
          const expiredAt = saved?.timestamp + parseTime(maxAge);

          if (Date.now() >= expiredAt) {
            itemExpired({ key, value: saved.value });
            await removeSavedItemFx(key);
            return null;
          }
        }

        return { value: saved.value, cachedAt: saved.timestamp };
      }),
      set: createEffect<{ key: string; value: unknown }, void>(
        async ({ key, value }) => {
          const meta = await getMetaFx();

          const keysAmount = meta?.keys?.length ?? 0;

          if (maxEntries && keysAmount >= maxEntries) {
            const forDelete = meta?.keys?.slice(0, keysAmount - maxEntries + 1);

            for (const key of forDelete ?? []) {
              itemEvicted({ key });
              await removeSavedItemFx(key);
            }
          }
          await setSavedItemFx({ key, value });
        }
      ),
      unset: createEffect<{ key: string }, void>(async ({ key }) => {
        await removeSavedItemFx(key);
      }),
      purge,
    };

    attachObservability({
      adapter,
      options: observability,
      events: { itemExpired, itemEvicted },
    });

    return createCacheAdapter(adapter);
  }

  interface SavedItem {
    timestamp: number;
    value: unknown;
  }

  // -- meta storage
  const $meta = createStore<Meta | null>(null, { serialize: 'ignore' });

  const getMetaFx = createEffect(async () => {
    const meta = await getItemFx(META_KEY);

    if (!meta) return null;

    try {
      const parsed = JSON.parse(meta);

      return parsed as Meta;
    } catch {
      return null;
    }
  });

  const setMetaFx = createEffect((meta: Meta) =>
    setItemFx({ key: META_KEY, value: JSON.stringify(meta) })
  );

  const addKey = createEvent<{ key: string }>();
  const removeKey = createEvent<{ key: string }>();

  const metaStorage = {
    $meta,
    addKey,
    removeKey,
  };

  sample({ clock: getMetaFx.doneData, target: $meta });
  sample({ clock: $meta, filter: Boolean, target: setMetaFx });
  sample({
    clock: addKey,
    source: $meta,
    fn: (meta, { key }) => {
      const knownKeys = meta?.keys ?? [];

      if (knownKeys.includes(key)) {
        return meta;
      }

      return { ...meta, keys: [...knownKeys, key] };
    },
    target: $meta,
  });
  sample({
    clock: removeKey,
    source: $meta,
    fn: (meta, { key }) => ({
      ...meta,
      keys: meta?.keys?.filter((k) => k !== key) ?? [],
    }),
    target: $meta,
  });

  interface Meta {
    keys?: string[];
  }

  // -- storage effects

  const setItemFx = createEffect((params: { key: string; value: string }) => {
    storage().setItem(params.key, params.value);
  });

  const getItemFx = createEffect((key: string) => storage().getItem(key));

  const removeItemFx = createEffect((key: string) => storage().removeItem(key));

  // public
  return storageCache();
}
