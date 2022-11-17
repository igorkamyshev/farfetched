/**
 * @vitest-environment jsdom
 */

import { createEvent, fork, scopeBind } from 'effector';
import { describe, beforeEach, test, expect, vi } from 'vitest';

import { localStorageCache } from '../local_storage';

describe('localStorageCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('expire (in other tab)', async () => {
    const expired = createEvent<{ key: string }>();
    const listener = vi.fn();
    expired.watch(listener);

    vi.useFakeTimers();

    // Tab one
    const cacheTabOne = localStorageCache({
      maxAge: '1sec',
      observability: { expired },
    });

    const scopeTabOne = fork();

    await scopeBind(cacheTabOne.set, {
      scope: scopeTabOne,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cacheTabOne.get, {
      scope: scopeTabOne,
    })({ key: 'key' });
    expect(resultOne?.value).toEqual('myValue');

    // Tick between tabs change, does not affect timer in cacheTabOne
    vi.advanceTimersByTime(1 * 1000);

    // Tab two
    const cacheTabTwo = localStorageCache({ maxAge: '1sec' });

    const scopeTabTwo = fork();

    const resultTwo = await scopeBind(cacheTabTwo.get, {
      scope: scopeTabTwo,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
    expect(localStorage.getItem('key')).toBeNull();

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith({ key: 'key' });
  });
});
