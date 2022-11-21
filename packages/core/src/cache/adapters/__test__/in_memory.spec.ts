import { createEvent, fork, scopeBind } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { inMemoryCache } from '../in_memory';

describe('inMemoryCache', () => {
  test('expire (in while throttling)', async () => {
    const expired = createEvent<{ key: string }>();
    const listener = vi.fn();
    expired.watch(listener);

    vi.useFakeTimers();

    // Tab one
    const cache = inMemoryCache({
      maxAge: '1sec',
      observability: { expired },
    });

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultOne?.value).toEqual('myValue');

    // Tick between tabs change, does not affect timer in cacheTabOne
    vi.advanceTimersByTime(1 * 1000);

    const resultTwo = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith({ key: 'key' });
  });
});
