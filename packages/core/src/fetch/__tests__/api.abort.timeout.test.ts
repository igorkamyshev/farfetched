import { allSettled, createStore, fork } from 'effector';
import { setTimeout } from 'timers/promises';

import { expectEffectFail, watchEffect } from '../../test_utils/watch_effect';
import { TimeoutError } from '../../utils/timeout_abort_controller';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.abort.timeout', () => {
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

  test('fail effect and cancel execution execution after timeout (static)', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout },
    });

    const watcher = watchEffect(apiCallFx);

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementation((arg) => setTimeout(100).then(() => fetch(arg)));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    expect(fetchMock.mock.lastCall[0].signal.aborted).toBeTruthy();
    expectEffectFail(watcher, new TimeoutError(timeout));
  });

  test('fail effect and cancel execution execution after timeout (reactive)', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout: createStore(timeout) },
    });

    const watcher = watchEffect(apiCallFx);

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementation((arg) => setTimeout(100).then(() => fetch(arg)));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    expect(fetchMock.mock.lastCall[0].signal.aborted).toBeTruthy();
    expectEffectFail(watcher, new TimeoutError(timeout));
  });

  test('fail slow effect and do not canel fast request', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout },
    });
    const watcher = watchEffect(apiCallFx);

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementationOnce((arg) => setTimeout(100).then(() => fetch(arg)))
      .mockImplementationOnce(() => new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    // Cancell first slow request
    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
    expect(watcher.onFail).toBeCalledTimes(1);
    expect(watcher.onFailData).toBeCalledWith(new TimeoutError(timeout));

    // Do not cancel second fast request
    expect(fetchMock.mock.calls[1][0].signal.aborted).toBeTruthy();
    expect(watcher.onDone).toBeCalledTimes(1);
  });
});
