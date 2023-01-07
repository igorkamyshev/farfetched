import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { watchEffect } from '@farfetched/test-utils';
import { describe, test, expect } from 'vitest';

import { abortError } from '../../errors/create_error';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('fetch/api.concurrency.strategy', () => {
  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'any body',
  };

  test('fail all effects but last with takeLatest', async () => {
    const apiCallFx = createApiRequest({
      request,
      response,
      concurrency: { strategy: 'TAKE_LATEST' as const },
    });

    const scope = fork({
      handlers: [
        [fetchFx, () => setTimeout(100).then(() => new Response('OK'))],
      ],
    });

    const watcher = watchEffect(apiCallFx, scope);

    const FIRST_QUERY = { index: '1' };
    const SECOND_QUERY = { index: '2' };
    const LATEST_QUERY = { index: 'latest' };

    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: FIRST_QUERY },
    });
    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: SECOND_QUERY },
    });
    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: LATEST_QUERY },
    });

    await allSettled(scope);

    // Fail first two
    expect(watcher.listeners.onFail).toBeCalledTimes(2);
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: FIRST_QUERY }),
        error: abortError(),
      })
    );
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: SECOND_QUERY }),
        error: abortError(),
      })
    );

    // Done latest
    expect(watcher.listeners.onDone).toBeCalledTimes(1);
    expect(watcher.listeners.onDone).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: LATEST_QUERY }),
      })
    );
  });

  test('ignore all effects but first with TAKE_FIRST', async () => {
    const apiCallFx = createApiRequest({
      request,
      response,
      concurrency: { strategy: 'TAKE_FIRST' as const },
    });

    const scope = fork({
      handlers: [
        [fetchFx, () => setTimeout(100).then(() => new Response('OK'))],
      ],
    });

    const watcher = watchEffect(apiCallFx, scope);

    const FIRST_QUERY = { index: '1' };
    const SECOND_QUERY = { index: '2' };
    const LATEST_QUERY = { index: 'latest' };

    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: FIRST_QUERY },
    });
    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: SECOND_QUERY },
    });
    // Do not await
    allSettled(apiCallFx, {
      scope,
      params: { query: LATEST_QUERY },
    });

    await allSettled(scope);

    // Done first
    expect(watcher.listeners.onDone).toBeCalledTimes(1);
    expect(watcher.listeners.onDone).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: FIRST_QUERY }),
      })
    );

    // Fail second and latest
    expect(watcher.listeners.onFail).toBeCalledTimes(2);
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: SECOND_QUERY }),
        error: abortError(),
      })
    );
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: LATEST_QUERY }),
        error: abortError(),
      })
    );
  });
});
