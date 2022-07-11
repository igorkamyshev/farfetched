import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';

import { watchEffect } from '../../test_utils/watch_effect';
import { AbortedError } from '../../utils/abortable';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.abapi.concurrency.strategy', () => {
  // Does not matter
  const response = {
    prepare: { extract: async <T>(v: T) => v },
    data: { validate: async () => null, extract: async <T>(v: T) => v },
    error: { is: async () => false, extract: async <T>(v: T) => v },
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
    const watcher = watchEffect(apiCallFx);

    const scope = fork({
      handlers: [
        [fetchFx, () => setTimeout(100).then(() => new Response('OK'))],
      ],
    });

    const FIRST_QUERY = new URLSearchParams({ index: '1' });
    const SECOND_QUERY = new URLSearchParams({ index: '2' });
    const LATEST_QUERY = new URLSearchParams({ index: 'latest' });

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
    expect(watcher.onFail).toBeCalledTimes(2);
    expect(watcher.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: FIRST_QUERY }),
        error: new AbortedError(),
      }),
    );
    expect(watcher.onFail).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: SECOND_QUERY }),
        error: new AbortedError(),
      }),
    );

    // Done latest
    expect(watcher.onDone).toBeCalledTimes(1);
    expect(watcher.onDone).toBeCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ query: LATEST_QUERY }),
      }),
    );
  });
});
