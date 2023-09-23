import { allSettled, createEffect, createEvent, createStore, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, vi, expect, test } from 'vitest';

import { withFactory } from '../../libs/patronus';
import { parseTime } from '../../libs/date-nfs';
import { Contract } from '../../contract/type';
import { createQuery } from '../../query/create_query';
import { inMemoryCache } from '../adapters/in_memory';
import { cache } from '../cache';
import { sha1 } from '../lib/hash';
import { createJsonQuery } from '../../query/create_json_query';
import { declareParams } from '../../remote_operation/params';
import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { stableStringify } from '../lib/stable_stringify';

describe('cache', () => {
  test('use value from cache on second call, revalidate', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(1000).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query);

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual(1);
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual(2);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);
  });

  test('use value from cache on second call, do not revalidate until staleAfter', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(1000).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query, { staleAfter: '1h' });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual(1);
    expect(scope.getState(query.$stale)).toBeFalsy();

    await allSettled(scope);

    // No refetch
    expect(handler).toBeCalledTimes(1);
  });

  test('mark value as stale since afterStale', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(100).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query, { staleAfter: '1sec' });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });
    await setTimeout(parseTime('1sec')); // wait for stale after time

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual(1);
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual(2);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);
  });

  test('ignore value that does not satisfy contract', async () => {
    const numberContract: Contract<unknown, number> = {
      isData: (x): x is number => typeof x === 'number',
      getErrorMessages: () => ['Not a number'],
    };

    const query = withFactory({
      fn: () =>
        createQuery({
          effect: createEffect(() =>
            setTimeout(1000).then(() => 12 as unknown)
          ),
          contract: numberContract,
        }),
      sid: '1',
    });

    const adapter = inMemoryCache();

    cache(query, { adapter });

    const scope = fork();

    // Force push invalid value to adapter

    await allSettled(adapter.set, {
      scope,
      params: {
        key: sha1(
          query.$data.sid +
            /* params is undefined */ JSON.stringify(undefined) +
            /* sources is [] */ JSON.stringify([])
        ),
        value: JSON.stringify('random string'),
      },
    });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache is not a number, did not put it to cache
    expect(scope.getState(query.$data)).toEqual(null);
    expect(scope.getState(query.$stale)).toBeTruthy();
  });

  test('save value to cache before mapData call', async () => {
    const mapData = vi.fn((n) => n + 1);
    const query = withFactory({
      fn: () =>
        createQuery({
          effect: createEffect(() => 1),
          mapData,
        }),
      sid: '1',
    });

    cache(query, { staleAfter: '10min' });

    const scope = fork();

    await allSettled(query.start, { scope });
    await allSettled(query.start, { scope });

    expect(mapData.mock.calls).toEqual([
      [expect.objectContaining({ result: 1 })],
      [expect.objectContaining({ result: 1 })],
    ]);
  });

  test('purge value after purge call', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(1000).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    const purge = createEvent();

    cache(query, { purge });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });
    await allSettled(purge, { scope });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick because of async adapter's nature
    await setTimeout(1);

    // Value from cache not found
    expect(scope.getState(query.$data)).toEqual(null);
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual(2);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);
  });

  test('works with non-serializable params', async () => {
    const logSpy = vi
      .spyOn(global.console, 'warn')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});
    let index = 1;

    const mockFn = vi.fn();

    const handler = vi.fn(async (_: typeof mockFn) =>
      setTimeout(1000).then(() => index++)
    );

    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query);

    const scope = fork();

    await allSettled(query.start, { scope, params: mockFn });

    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope, params: mockFn });
    // But wait for next tick because of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual(null);
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual(2);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);
  });

  test('ignore null-key', async () => {
    // params cannot be serialized
    const params: any = {};
    const internal = { params };
    params['some'] = internal;

    const handler = vi.fn(async (p: any) => 1);
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    const purge = createEvent();

    cache(query, { purge });

    const scope = fork();

    await allSettled(query.start, { scope, params });
    expect(scope.getState(query.$data)).toEqual(1);
  });

  test('do not use params if it is unnecessary (createJsonQuery)', async () => {
    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<string>(),
          request: {
            method: 'GET',
            url: (params) => `https://api.salo.com/${params.length.toString()}`,
          },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    cache(query);

    const scope = fork({
      handlers: [
        [
          fetchFx,
          vi
            .fn()
            .mockImplementationOnce(() =>
              setTimeout(100).then(
                () => new Response(JSON.stringify({ step: 1 }))
              )
            )
            .mockImplementationOnce(() =>
              setTimeout(100).then(
                () => new Response(JSON.stringify({ step: 2 }))
              )
            ),
        ],
      ],
    });

    await allSettled(query.start, { scope, params: 'lol' });
    expect(scope.getState(query.$data)).toEqual({ step: 1 });

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope, params: 'kek' });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual({ step: 1 });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual({ step: 2 });
    expect(scope.getState(query.$stale)).toBeFalsy();
  });

  test('do not use params if it is unnecessary (createJsonQuery)', async () => {
    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<string>(),
          request: {
            method: 'GET',
            url: (params) => `https://api.salo.com/${params}`,
          },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    cache(query);

    const scope = fork({
      handlers: [
        [
          fetchFx,
          vi
            .fn()
            .mockImplementationOnce(() =>
              setTimeout(100).then(
                () => new Response(JSON.stringify({ step: 1 }))
              )
            )
            .mockImplementationOnce(() =>
              setTimeout(100).then(
                () => new Response(JSON.stringify({ step: 2 }))
              )
            ),
        ],
      ],
    });

    await allSettled(query.start, { scope, params: 'lol' });
    expect(scope.getState(query.$data)).toEqual({ step: 1 });

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope, params: 'kek' });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // No value from cache
    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual({ step: 2 });
    expect(scope.getState(query.$stale)).toBeFalsy();
  });

  test('use createQuery#extraDependencies in cache-key', async () => {
    const $extraDependency = createStore(42);
    const MOCK_VALUE = 10;

    const query = withFactory({
      fn: () =>
        createQuery({
          handler: (params: any) => Promise.resolve(MOCK_VALUE),
          extraDependencies: [$extraDependency]
        }),

      sid: '1'
    });

    const adapter = inMemoryCache();
    cache(query, { adapter });

    const scope = fork();

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    /**
     * Only combination of parameters for cacheKey what is working
     * Its real pain to debug it (spend 2 hours adding here and there debug-mode logs)
     *
     * Probably, it would be better to have human-readable cache-key (and some UI to debug it)
     * Or to have some debug mode
     * Or, at least, have some utility to pass whole query and params to get cache-key like:
     * `cacheKey(query, params)`
     */
    const key = sha1(
      stableStringify({
        params: null, // Using `null` and not `undefined` bcs of stableStringify default behavior
        sources: [scope.getState($extraDependency)],
        sid: query.__.meta.sid // queryUniqId(query)
      })!
    );

    await allSettled(scope);

    const cachedResult = await adapter.get({ key: key });
    expect(cachedResult?.value).toEqual(MOCK_VALUE);
  });

  test('use createJsonQuery#extraDependencies in cache-key', async () => {
    const URL = 'https://api.salo.com/';
    const $extraDependency = createStore(42);
    const MOCK_VALUE = 10;

    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<void>(),
          request: {
            method: 'GET',
            url: URL,
          },
          response: {
            contract: unknownContract,
          },
          extraDependencies: [$extraDependency]
        }),

      sid: '1'
    });

    const adapter = inMemoryCache();
    cache(query, { adapter });

    const scope = fork({
      handlers: [
        [query.__.executeFx, vi.fn(() => MOCK_VALUE)]
      ]
    });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    /**
     * Only combination of parameters for cacheKey what is working
     *
     */
    const key = sha1(
      stableStringify({
        params: null, // Using `null` and not `undefined` bcs of stableStringify default behavior
        sources: [URL, scope.getState($extraDependency)],
        sid: query.__.meta.sid // queryUniqId(query)
      })!
    );

    await allSettled(scope);

    const cachedResult = await adapter.get({ key: key });
    expect(cachedResult?.value).toEqual(MOCK_VALUE);
  });
});
