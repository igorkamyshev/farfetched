import { createEffect, createEvent, sample } from 'effector';
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

        await metaStorage.addKeyFx({ key });

        await setItemFx({ key, value: item });
      }
    );

    const removeSavedItemFx = createEffect(async (key: string) => {
      await metaStorage.removeKeyFx({ key });
      await removeItemFx(key);
    });

    const itemExpired = createEvent<{ key: string; value: string }>();
    const itemEvicted = createEvent<{ key: string }>();

    const purge = createEvent();
    const purgeFx = createEffect(async () => {
      const keys = await metaStorage.getKeysFx();
      await Promise.all(keys.map(removeSavedItemFx));
    });

    sample({ clock: purge, target: purgeFx });

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
  // TODO: protect meta storage against races

  const META_KEY = '__farfetched_meta__';

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

  const metaStorage = {
    getKeysFx: createEffect(() => getMetaFx().then((meta) => meta?.keys ?? [])),
    addKeyFx: createEffect<{ key: string }, void>(async ({ key }) => {
      const meta = await getMetaFx();

      const newMeta = { ...meta, keys: [...(meta?.keys ?? []), key] };

      await setMetaFx(newMeta);
    }),
    removeKeyFx: createEffect<{ key: string }, void>(async ({ key }) => {
      const meta = await getMetaFx();

      const newMeta = {
        ...meta,
        keys: meta?.keys?.filter((k) => k !== key) ?? [],
      };

      await setMetaFx(newMeta);
    }),
  };

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
