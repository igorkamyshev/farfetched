import { allSettled, createEvent, fork } from 'effector';
import { vi, describe, test, expect } from 'vitest';

import { externalCache } from '../external';

describe('external adapter', () => {
  function externalMock() {
    const get = vi.fn();
    const set = vi.fn();
    const purge = vi.fn();

    return { get, set, purge };
  }

  test('set and get', async () => {
    const mock = externalMock();

    const cache = externalCache(mock);

    const scope = fork();

    await allSettled(cache.set, {
      scope,
      params: { key: 'key', value: 'myValue' },
    });
    expect(mock.set).toBeCalledTimes(1);
    expect(mock.set).toBeCalledWith({ key: 'key', value: 'myValue' });

    mock.get.mockImplementation(() => 'mockedValue');
    const resultOne = await allSettled(cache.get, {
      scope,
      params: { key: 'key' },
    });
    expect(resultOne?.value).toEqual('mockedValue');
  });

  test('purge removes all values', async () => {
    const mock = externalMock();
    const cache = externalCache(mock);

    const scope = fork();

    await allSettled(cache.purge, { scope });

    expect(mock.purge).toBeCalledTimes(1);
  });

  describe('observability', () => {
    test('on key found — hit', async () => {
      const hit = createEvent<{ key: string }>();

      const listener = vi.fn();
      hit.watch(listener);

      const mock = externalMock();

      mock.get.mockImplementation(() => 'Some value');

      const cache = externalCache({ ...mock, observability: { hit } });

      const scope = fork();

      await allSettled(cache.get, {
        params: { key: 'someKey' },
        scope,
      });

      expect(listener).toBeCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'someKey' });
    });

    test('on key not found — miss', async () => {
      const miss = createEvent<{ key: string }>();

      const listener = vi.fn();
      miss.watch(listener);

      const mock = externalMock();
      mock.get.mockImplementation(() => null);
      const cache = externalCache({ ...mock, observability: { miss } });

      const scope = fork();

      await allSettled(cache.get, {
        params: { key: 'otherKey' },
        scope,
      });

      expect(listener).toBeCalledTimes(1);
      expect(listener).toBeCalledWith({ key: 'otherKey' });
    });
  });
});
