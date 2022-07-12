// TODO: jest-28
import 'whatwg-fetch';

import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { watchEffect } from '@farfetched/test-utils';

import { AbortedError } from '../../misc/abortable';
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
    const abort = createEvent();

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

    await allSettled(apiCallFx, {
      scope,
      params: { query: LATEST_QUERY },
    });

    await allSettled(abort, { scope });

    // Fail first two
    expect(watcher.listeners.onFail).toBeCalledTimes(2);
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: FIRST_QUERY }),
        error: new AbortedError(),
      })
    );
    expect(watcher.listeners.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: SECOND_QUERY }),
        error: new AbortedError(),
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
});
