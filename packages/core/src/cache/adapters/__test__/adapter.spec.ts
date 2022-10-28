/**
 * @vitest-environment jsdom
 */

import { allSettled, createEvent, fork, scopeBind } from 'effector';
import { withFactory } from 'packages/core/src/misc/sid';
import { setTimeout } from 'timers/promises';
import { describe, beforeEach, test, expect, vi } from 'vitest';

import { inMemoryCache } from '../in_memory';
import { localStorageCache } from '../local_storage';
import { sessionStorageCache } from '../session_storage';
import { voidCache } from '../void';

describe.each([
  { name: 'inMemory', adapter: inMemoryCache },
  { name: 'sessionSotrage', adapter: sessionStorageCache },
  { name: 'localStorage', adapter: localStorageCache },
])('adapter $name', ({ adapter }) => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('save and get', async () => {
    const cache = adapter();

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultOne?.value).toEqual('myValue');

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key2', value: 'otherValue' });

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultTwo?.value).toEqual('myValue');
  });

  test('evict', async () => {
    const cache = adapter({ maxEntries: 1 });

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'first', value: 'first' });

    await scopeBind(cache.set, {
      scope,
    })({ key: 'second', value: 'second' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'first' });
    expect(resultOne).toBeNull();

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'second' });
    expect(resultTwo?.value).toBe('second');
  });

  test('expire', async () => {
    const cache = adapter({ maxAge: '1sec' });

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultOne?.value).toEqual('myValue');

    await setTimeout(1 * 1000);

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
  });

  test('purge removes all values', async () => {
    const cache = adapter();

    const scope = fork();

    await Promise.all([
      allSettled(cache.set, {
        scope,
        params: { key: 'one', value: 'oneValue' },
      }),
      allSettled(cache.set, {
        scope,
        params: { key: 'two', value: 'twoValue' },
      }),
    ]);

    await allSettled(cache.purge, { scope });

    const [resultOne, resultTwo] = await Promise.all([
      allSettled(cache.get, {
        scope,
        params: { key: 'one' },
      }),
      allSettled(cache.get, {
        scope,
        params: { key: 'two' },
      }),
    ]);

    expect(resultOne.value).toBeNull();
    expect(resultTwo.value).toBeNull();
  });

  describe('observability', () => {
    test('on key found — hit', async () => {
      const hit = createEvent<{ key: string }>();

      const listener = vi.fn();
      hit.watch(listener);

      const scope = fork();

      const cache = adapter({ observability: { hit } });

      await allSettled(cache.set, {
        params: { key: 'someKey', value: 'someValue ' },
        scope,
      });

      await allSettled(cache.get, {
        params: { key: 'someKey' },
        scope,
      });

      await allSettled(cache.get, {
        params: { key: 'otherKey' },
        scope,
      });

      expect(listener).toBeCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'someKey' });
    });

    test('on key not found — miss', async () => {
      const miss = createEvent<{ key: string }>();

      const listener = vi.fn();
      miss.watch(listener);

      const scope = fork();

      const cache = adapter({ observability: { miss } });

      await allSettled(cache.set, {
        params: { key: 'someKey', value: 'someValue ' },
        scope,
      });

      await allSettled(cache.get, {
        params: { key: 'someKey' },
        scope,
      });

      await allSettled(cache.get, {
        params: { key: 'otherKey' },
        scope,
      });

      expect(listener).toBeCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'otherKey' });
    });

    test('expired', async () => {
      const expired = createEvent<{ key: string }>();
      const listener = vi.fn();
      expired.watch(listener);

      const cache = adapter({ maxAge: '1sec', observability: { expired } });

      const scope = fork();

      await scopeBind(cache.set, {
        scope,
      })({ key: 'firstKey', value: 'myValue' });

      await setTimeout(1 * 1000);

      await scopeBind(cache.set, {
        scope,
      })({ key: 'secondKey', value: 'otherValue' });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'firstKey' });
    });

    test('evicted', async () => {
      const evicted = createEvent<{ key: string }>();
      const listener = vi.fn();
      evicted.watch(listener);

      const cache = adapter({ maxEntries: 1, observability: { evicted } });

      const scope = fork();

      await scopeBind(cache.set, {
        scope,
      })({ key: 'firstKey', value: 'myValue' });

      await scopeBind(cache.set, {
        scope,
      })({ key: 'secondKey', value: 'otherValue' });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'firstKey' });
    });
  });

  test('replacable', async () => {
    const cache = withFactory({ fn: () => adapter(), sid: '1' });
    const mockCache = withFactory({ fn: () => voidCache(), sid: '2' });

    const scope = fork({ values: [[cache.__.$instance, mockCache]] });

    // it have to be void adapter
    const scopedAdapter = scope.getState(cache.__.$instance);

    await allSettled(scopedAdapter.set, {
      params: { key: 'someKey', value: 'someValue ' },
      scope,
    });

    const result = await allSettled(scopedAdapter.get, {
      params: { key: 'someKey' },
      scope,
    });

    expect(result.value).toBeNull();
  });
});
