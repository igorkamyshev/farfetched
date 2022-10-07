import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { watchEffect } from '@farfetched/test-utils';
import { describe, test, expect, vi } from 'vitest';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';
import { abortError } from '../../errors/create_error';

describe('remote_data/transport/api.abort.signal', () => {
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

  test('fail effect after abort call', async () => {
    const abort = createEvent<string>();

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { clock: abort },
    });

    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        setTimeout(1000).then(() => new Response('OK'))
      );

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    const watcher = watchEffect(apiCallFx, scope);

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });

    await allSettled(abort, { scope, params: 'random string' });

    expect(watcher.listeners.onFailData).toHaveBeenCalledTimes(1);
    expect(watcher.listeners.onFailData).toHaveBeenCalledWith(abortError());

    expect(watcher.listeners.onDone).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
  });
});
