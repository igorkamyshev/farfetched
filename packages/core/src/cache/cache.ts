import { attach, createEffect, Event, sample } from 'effector';

import { parseTime, type Time } from '../libs/date-nfs';
import { type Query } from '../query/type';
import { inMemoryCache } from './adapters/in_memory';
import { type CacheAdapter, type CacheAdapterInstance } from './adapters/type';
import { createKey, queryUniqId } from './key/key';
import { createSourcedReader } from '../libs/patronus';

interface CacheParameters {
  adapter?: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;

  debug?: boolean;
}

interface CacheParametersDefaulted {
  adapter: CacheAdapter;
  staleAfter?: Time;
  purge?: Event<void>;
  debug?: boolean;
}

export function cache<Q extends Query<any, any, any, any>>(
  query: Q,
  rawParams?: CacheParameters
): void {
  const { adapter, staleAfter, purge,debug }: CacheParametersDefaulted = {
    adapter: rawParams?.adapter ?? inMemoryCache(),
    ...rawParams,
  };

  const id = queryUniqId(query);

  const sourcedReaders = query.__.lowLevelAPI.sourced.map(createSourcedReader);
  const readAllSourcedFx = createEffect(async (params: unknown) => {
    return Promise.all(sourcedReaders.map((readerFx) => readerFx(params)));
  });

  const unsetFx = createEffect<
    {
      params: unknown;
      instance: CacheAdapterInstance;
    },
    void,
    any
  >(async ({ instance, params }) => {
    if(debug){
      console.log('[cache] (unsetFx) start', { params });
    }

    const sources = await readAllSourcedFx(params);

    if(debug){
      console.log('[cache] (unsetFx) readAllSourcedFx.doneData', sources);
    }

    const key = createKey({
      sid: id,
      params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
      sources,

      debug,
    });

    if(debug) {
      console.log('[cache] (unsetFx) createKey', {
        result: key,
        params: {
          sid: id,
          params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
          sources,
          paramsAreMeaningless: query.__.lowLevelAPI.paramsAreMeaningless
        }
      });
    }

    if (!key) {
      return;
    }

    await instance.unset({ key });
  });

  const setFx = createEffect<
    {
      params: unknown;
      result: unknown;
      instance: CacheAdapterInstance;
    },
    void,
    any
  >(async ({ instance, params, result }) => {
    if(debug){
      console.log('[cache] (setFx) start', { params });
    }

    const sources = await readAllSourcedFx(params);

    if(debug){
      console.log('[cache] (setFx) readAllSourcedFx.doneData', sources);
    }

    const key = createKey({
      sid: id,
      params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
      sources,
    });

    if(debug) {
      console.log('[cache] (setFx) createKey', {
        result: key,
        params: {
          sid: id,
          params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
          sources,
          paramsAreMeaningless: query.__.lowLevelAPI.paramsAreMeaningless
        }
      });
    }

    if (!key) {
      return;
    }

    await instance.set({ key, value: result });
  });

  const getFx = createEffect<
    { params: unknown; instance: CacheAdapterInstance },
    { result: unknown; stale: boolean } | null,
    any
  >(async ({ params, instance }) => {
    if(debug) {
      console.log('[cache] (getFx) start', { params });
    }
    const sources = await readAllSourcedFx(params);

    if(debug){
      console.log('[cache] (getFx) readAllSourcedFx.doneData', sources);
    }

    const key = createKey({
      sid: id,
      params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
      sources,
    });

    if(debug) {
      console.log('[cache] (getFx) createKey', {
        result: key,
        params: {
          sid: id,
          params: query.__.lowLevelAPI.paramsAreMeaningless ? null : params,
          sources,
          paramsAreMeaningless: query.__.lowLevelAPI.paramsAreMeaningless
        }
      });
    }

    if (!key) {
      return null;
    }

    const result = await instance.get({ key });

    if(debug) {
      console.log('[cache] (getFx) instance.get', {
        result,
        params: {
          key
        }
      });
    }

    if (!result) {
      return null;
    }

    const stale = staleAfter
      ? result.cachedAt + parseTime(staleAfter!) <= Date.now()
      : true;

    if(debug) {
      console.log('[cache] (getFx) staleAfter', {
        result,
        params: {
          staleAfter,
          cachedAt: result.cachedAt,
          stale: stale,
          now: Date.now()
        }
      });
    }

    return { result: result.value, stale };
  });

  const cacheDatSource = {
    name: 'cache',
    get: attach({
      source: {
        instance: adapter.__.$instance,
      },
      mapParams: ({ params }: { params: unknown }, { instance }) => ({
        params,
        instance,
      }),
      effect: getFx,
    }),
    set: attach({
      source: {
        instance: adapter.__.$instance,
      },
      mapParams: (
        { params, result }: { params: unknown; result: unknown },
        { instance }
      ) => ({
        params,
        result,
        instance,
      }),
      effect: setFx,
    }),
    unset: attach({
      source: {
        instance: adapter.__.$instance,
      },
      mapParams: ({ params }: { params: unknown }, { instance }) => ({
        instance,
        params,
      }),
      effect: unsetFx,
    }),
  };

  query.__.lowLevelAPI.dataSources.unshift(cacheDatSource);

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
