/**
 * @vitest-environment jsdom
 */

import { fork, type Json, scopeBind } from 'effector';
import { describe, beforeEach, test, expect, vi } from 'vitest';

import { localStorageCache } from '../local_storage';
import { sessionStorageCache } from '../session_storage';

describe.each([
  { name: 'sessionSotrage', adapter: sessionStorageCache },
  { name: 'localStorage', adapter: localStorageCache },
])('adapter $name', ({ adapter }) => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('serialize', () => {
    test('use custom read', async () => {
      const read = vi.fn(() => 'custom read');

      const cache = adapter({
        serialize: {
          read,
          write: (value: unknown) => value as Json,
        },
      });

      const scope = fork();

      await scopeBind(cache.set, {
        scope,
      })({ key: 'key', value: 'myValue' });

      const valueFromCache = await scopeBind(cache.get, {
        scope,
      })({ key: 'key' });

      expect(read).toBeCalledTimes(1);
      expect(read).toBeCalledWith('myValue');
      expect(valueFromCache?.value).toEqual('custom read');
    });
  });

  test('custom write', async () => {
    const write = vi.fn(() => 'custom write');

    const cache = adapter({
      serialize: {
        read: (value: unknown) => value as Json,
        write,
      },
    });

    const scope = fork();

    await scopeBind(cache.set, {
      scope,
    })({ key: 'key', value: 'myValue' });

    const valueFromCache = await scopeBind(cache.get, {
      scope,
    })({ key: 'key' });

    expect(write).toBeCalledTimes(1);
    expect(write).toBeCalledWith('myValue');
    expect(valueFromCache?.value).toEqual('custom write');
  });
});
