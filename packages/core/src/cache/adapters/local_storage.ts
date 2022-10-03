import { createEffect, sample } from 'effector';
import { delay } from 'patronum';

import { parseTime, Time } from '../lib/time';
import { CacheAdapter } from './type';

// -- adapter

export function localStorageCache(config?: {
  maxEntries?: number;
  maxAge?: Time;
}): CacheAdapter {
  const { maxEntries, maxAge } = config ?? {};

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

  if (maxAge) {
    sample({
      clock: delay({ source: setItemFx.done, timeout: parseTime(maxAge) }),
      fn: ({ params }) => params.key,
      target: removeSavedItemFx,
    });
  }

  return {
    get: createEffect<{ key: string }, string | null>(async ({ key }) => {
      const saved = await getSavedItemFx(key);

      if (!saved) return null;

      if (maxAge) {
        const expiredAt = saved?.timestamp + parseTime(maxAge);

        if (Date.now() >= expiredAt) {
          await removeSavedItemFx(key);
          return null;
        }
      }

      return saved.value;
    }),
    set: createEffect<{ key: string; value: string }, void>(
      async ({ key, value }) => {
        const meta = await getMetaFx();

        const keysAmount = meta?.keys?.length ?? 0;

        if (maxEntries && keysAmount >= maxEntries) {
          const forDelete = meta?.keys?.slice(0, keysAmount - maxEntries + 1);

          for (const key of forDelete ?? []) {
            await removeSavedItemFx(key);
          }
        }
        await setSavedItemFx({ key, value });
      }
    ),
  };
}

interface SavedItem {
  timestamp: number;
  value: string;
}

// -- meta storage

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

// -- localStorage effects

const setItemFx = createEffect((params: { key: string; value: string }) => {
  localStorage.setItem(params.key, params.value);
});

const getItemFx = createEffect((key: string) => localStorage.getItem(key));

const removeItemFx = createEffect((key: string) =>
  localStorage.removeItem(key)
);
