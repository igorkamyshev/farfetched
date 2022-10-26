import { createEffect, Event, sample, split } from 'effector';
import { time } from 'patronum';

import { Query } from '../query/type';
import { RemoteOperationParams } from '../remote_operation/type';
import { CacheAdapter, CacheAdapterInstance } from './adapters/type';
import { enrichFinishedSuccessWithKey, enrichStartWithKey } from './key/key';
import { parseTime, Time } from './lib/time';

interface CacheParameters {
  adapter: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
}

export function cache<Q extends Query<any, any, any>>(
  query: Q,
  params: CacheParameters
): void {
  query.__.cmd.registerInterruption();

  connectPurge(params);
  saveToCache(query, params);
  pickFromCache(query, params);
}

function connectPurge({ adapter, purge }: CacheParameters) {
  if (purge) {
    const purgeCachedValuesFx = createEffect(
      ({ instance }: { instance: CacheAdapterInstance }) => instance.purge()
    );

    sample({
      clock: purge,
      source: { instance: adapter.__.$instance },
      target: purgeCachedValuesFx,
    });
  }
}

function saveToCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter }: CacheParameters
) {
  const putCachedValueFx = createEffect(
    ({
      instance,
      key,
      value,
    }: {
      instance: CacheAdapterInstance;
      key: string;
      value: unknown;
    }) => instance.set({ key, value })
  );
  const doneWithKey = enrichFinishedSuccessWithKey(query);

  sample({
    clock: doneWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key, data }) => ({
      instance,
      key,
      value: data,
    }),
    target: putCachedValueFx,
  });
}

function pickFromCache<Q extends Query<any, any, any>>(
  query: Q,
  { adapter, staleAfter }: CacheParameters
) {
  const pickCachedValueFx = createEffect(
    async ({
      instance,
      key,
    }: {
      instance: CacheAdapterInstance;
      key: string;
      params: RemoteOperationParams<Q>;
    }) => instance.get({ key })
  );

  const startWithKey = enrichStartWithKey(query);

  const $now = time({ clock: pickCachedValueFx });

  sample({
    clock: startWithKey,
    source: adapter.__.$instance,
    fn: (instance, { key, params }) => ({ instance, key, params }),
    target: pickCachedValueFx,
  });

  const { found, __: notFound } = split(pickCachedValueFx.done, {
    found: ({ result }) => Boolean(result),
  });

  const { __: foundStale, foundFresh } = split(
    sample({ clock: found, source: $now, fn: (now, f) => ({ ...f, now }) }),
    {
      foundFresh: ({ result, now }) => {
        if (!staleAfter || !result) {
          return false;
        }

        return result.cachedAt + parseTime(staleAfter) > now;
      },
    }
  );

  sample({
    clock: [
      sample({ clock: foundStale, fn: (p) => ({ ...p, isFreshData: false }) }),
      sample({ clock: foundFresh, fn: (p) => ({ ...p, isFreshData: true }) }),
    ],
    fn: ({ result, params, isFreshData }) => ({
      result: result!.value,
      params: params.params,
      meta: { stopErrorPropagation: true, isFreshData },
    }),
    target: query.__.cmd.fillData,
  });

  sample({
    clock: [foundStale, notFound],
    fn: ({ params }) => ({ params: params.params }),
    target: query.__.cmd.resumeExecution,
  });
}
