/**
 * @jest-environment jsdom
 */

import { fork, scopeBind } from 'effector';
import { setTimeout } from 'timers/promises';

import { sessionStorageCache } from '../session_storage';

describe('sessionStorageCache', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('save and get', async () => {
    const cache = sessionStorageCache();

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultOne).toEqual('myValue');

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key2', value: 'otherValue' });

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultTwo).toEqual('myValue');
  });

  test('evict', async () => {
    const cache = sessionStorageCache({ maxEntries: 1 });

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
    expect(resultTwo).toBe('second');
  });

  test('expire', async () => {
    const cache = sessionStorageCache({ maxAge: '1sec' });

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultOne).toEqual('myValue');

    await setTimeout(1 * 1000);

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
  });

  test('expire (in other tab)', async () => {
    jest.useFakeTimers();

    // Tab one
    const cacheTabOne = sessionStorageCache({ maxAge: '1sec' });

    const scopeTabOne = fork();

    await scopeBind(cacheTabOne.set, {
      scope: scopeTabOne,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cacheTabOne.get, {
      scope: scopeTabOne,
    })({ key: 'key' });
    expect(resultOne).toEqual('myValue');

    // Tick between tabs change, does not affect timer in cacheTabOne
    jest.advanceTimersByTime(1 * 1000);

    // Tab two
    const cacheTabTwo = sessionStorageCache({ maxAge: '1sec' });

    const scopeTabTwo = fork();

    const resultTwo = await scopeBind(cacheTabTwo.get, {
      scope: scopeTabTwo,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
    expect(sessionStorage.getItem('key')).toBeNull();
  });
});
