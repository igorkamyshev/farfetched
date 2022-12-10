/**
 * @vitest-environment jsdom
 */

import { createEvent, fork, scopeBind } from 'effector';
import { describe, beforeEach, test, expect, vi } from 'vitest';

import { sessionStorageCache } from '../session_storage';

describe('sessionStorageCache', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('expire (after page reload)', async () => {
    const expired = createEvent<{ key: string }>();
    const listener = vi.fn();
    expired.watch(listener);

    vi.useFakeTimers();

    // Tab one
    const cacheBeforeReload = sessionStorageCache({
      maxAge: '1sec',
      observability: { expired },
    });

    const scopeBeforeReload = fork();

    await scopeBind(cacheBeforeReload.set, {
      scope: scopeBeforeReload,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cacheBeforeReload.get, {
      scope: scopeBeforeReload,
    })({ key: 'key' });
    expect(resultOne?.value).toEqual('myValue');

    // Tick between tabs change, does not affect timer in cacheBeforeReload
    vi.advanceTimersByTime(1 * 1000);

    // Tab two
    const cacheAfterReload = sessionStorageCache({ maxAge: '1sec' });

    const scopeAfterReload = fork();

    const resultTwo = await scopeBind(cacheAfterReload.get, {
      scope: scopeAfterReload,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
    expect(sessionStorage.getItem('key')).toBeNull();

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith({ key: 'key' });
  });
});
