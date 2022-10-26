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

export function browserStorageCache(
  config: {
    storage: Storage;
  } & CacheAdapterOptions
): CacheAdapter {
  const { storage, observability } = config;
  // -- adapter
  function storageCache(): CacheAdapter {
    const { maxEntries, maxAge } = config;

    const getSavedItemFx = createEffect(async (key: string) => {
      const item = await getItemFx(key);

      if (!item) return null;

      try {
        const parsed = JSON.parse(item);

        return parsed as SavedItem;
      } catch {
        return null;
      }
    });

    const setSavedItemFx = createEffect(
      async ({ key, value }: { key: string; value: string }) => {
        const item = JSON.stringify({ value, timestamp: Date.now() });

        metaStorage.addKey({ key });

        await setItemFx({ key, value: item });
      }
    );

    const removeSavedItemFx = createEffect(async (key: string) => {
      metaStorage.removeKey({ key });
      await removeItemFx(key);
    });

    const itemExpired = createEvent<{ key: string; value: string }>();
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
          source: sample({
            clock: setItemFx.done,
            filter: ({ params }) => params.key !== META_KEY,
          }),
          timeout: parseTime(maxAge),
        }),
        fn: (params) => ({
          key: params.params.key,
          value: params.params.value,
        }),
        target: [itemExpired, removeSavedItemFx],
      });
    }

    const adapter = {
      get: createEffect<
        { key: string },
        { value: string; cachedAt: number } | null
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
      set: createEffect<{ key: string; value: string }, void>(
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
      purge,
    };

    attachObservability({
      adapter,
      options: observability,
      events: { itemExpired, itemEvicted },
    });

    return createAdapter(adapter);
  }

  interface SavedItem {
    timestamp: number;
    value: string;
  }

  // -- meta storage
  const META_KEY = '__farfetched_meta__';

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
    fn: (meta, { key }) => ({ ...meta, keys: [...(meta?.keys ?? []), key] }),
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
    storage.setItem(params.key, params.value);
  });

  const getItemFx = createEffect((key: string) => storage.getItem(key));

  const removeItemFx = createEffect((key: string) => storage.removeItem(key));

  // public
  return storageCache();
}
