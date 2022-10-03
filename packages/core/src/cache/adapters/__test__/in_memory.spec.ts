import { fork, scopeBind } from 'effector';
import { setTimeout } from 'timers/promises';

import { inMemoryCache } from '../in_memory';

describe('inMemoryCache', () => {
  test('save and get', async () => {
    const cache = inMemoryCache();

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
    const cache = inMemoryCache({ maxEntries: 1 });

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
    const cache = inMemoryCache({ maxAge: '1sec' });

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
});
