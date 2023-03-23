import {
  attach,
  combine,
  createEffect,
  Effect,
  Event,
  merge,
  sample,
} from 'effector';

import { parseTime, type Time } from '../libs/date-nfs';
import { type Query } from '../query/type';
import { inMemoryCache } from './adapters/in_memory';
import { type CacheAdapter, type CacheAdapterInstance } from './adapters/type';
import { createKey, queryUniqId } from './key/key';
import { get } from '../libs/lohyphen';

interface CacheParameters {
  adapter?: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
}

interface CacheParametersDefaulted {
  adapter: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
}

export function cache<Q extends Query<any, any, any, any>>(
  query: Q,
  rawParams?: CacheParameters
): void {
  const anyStart = merge([query.start, query.refresh]);

  const params: CacheParametersDefaulted = {
    adapter: rawParams?.adapter ?? inMemoryCache(),
    ...rawParams,
  };

  const { adapter, staleAfter, purge } = params;

  const removeFromCacheFx: Effect<{ params: unknown }, void, any> = attach({
    source: {
      instance: adapter.__.$instance,
      sources: combine(
        query.__.lowLevelAPI.sourced.map((sourced) =>
          sourced(query.__.lowLevelAPI.revalidate.map(get('params')))
        )
      ),
    },
    async effect({ instance, sources }, { params }: { params: unknown }) {
      const key = createKey({
        sid: queryUniqId(query),
        params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
        sources,
      });

      if (!key) {
        return;
      }

      await instance.unset({ key });
    },
  });

  const saveToCacheFx: Effect<{ params: unknown; result: unknown }, void, any> =
    attach({
      source: {
        instance: adapter.__.$instance,
        sources: combine(
          query.__.lowLevelAPI.sourced.map((sourced) =>
            sourced(query.finished.success.map(get('params')))
          )
        ),
      },
      async effect(
        { instance, sources },
        { params, result }: { params: unknown; result: unknown }
      ) {
        const key = createKey({
          sid: queryUniqId(query),
          params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
          sources,
        });

        if (!key) {
          return;
        }

        await instance.set({ key, value: result });
      },
    });

  const getFromCacheFx: Effect<
    { params: unknown },
    { result: unknown; stale: boolean } | null,
    any
  > = attach({
    source: {
      instance: adapter.__.$instance,
      sources: combine(
        query.__.lowLevelAPI.sourced.map((sourced) => sourced(anyStart))
      ),
    },
    async effect({ instance, sources }, { params }: { params: unknown }) {
      const key = createKey({
        sid: queryUniqId(query),
        params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
        sources,
      });

      if (!key) {
        return null;
      }

      const result = await instance.get({ key });

      if (!result) {
        return null;
      }

      const stale = staleAfter
        ? result.cachedAt + parseTime(staleAfter!) <= Date.now()
        : true;

      return { result: result.value, stale };
    },
  });

  query.__.lowLevelAPI.dataSources.unshift({
    name: 'cache',
    get: getFromCacheFx,
    set: saveToCacheFx,
    unset: removeFromCacheFx,
  });

  if (purge) {
    sample({
      clock: purge,
      source: { instance: adapter.__.$instance },
      target: createEffect(({ instance }: { instance: CacheAdapterInstance }) =>
        instance.purge()
      ),
    });
  }
}
