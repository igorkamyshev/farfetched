import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { watchEffect } from '@farfetched/test-utils';

import { AbortedError } from '../../misc/abortable';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

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

    const fetchMock = jest
      .fn()
      .mockImplementation(() =>
        setTimeout(1000).then(() => new Response('OK'))
      );

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    const watcher = watchEffect(apiCallFx, scope);

    // Do not await
    await allSettled(apiCallFx, { scope, params: {} });

    // await allSettled(abort, { scope, params: 'random string' });

    console.log(fetchMock.mock);

    expect(watcher.listeners.onFailData).toHaveBeenCalledTimes(1);
    expect(watcher.listeners.onFailData).toHaveBeenCalledWith(
      new AbortedError()
    );

    expect(watcher.listeners.onDone).not.toHaveBeenCalled();

    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
  });
});
