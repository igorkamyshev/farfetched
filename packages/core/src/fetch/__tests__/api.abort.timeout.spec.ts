// TODO: jest-28
import 'whatwg-fetch';

import { allSettled, createStore, fork } from 'effector';
import { setTimeout } from 'timers/promises';

import { TimeoutError } from '../../misc/timeout_abort_controller';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';
import { watchEffect } from '@farfetched/test-utils';

describe('fetch/api.abort.timeout', () => {
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

  test('fail effect and cancel execution execution after timeout (static)', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout },
    });

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementation((arg) => setTimeout(100).then(() => fetch(arg)));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    const watcher = watchEffect(apiCallFx, scope);

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
    expect(watcher.listeners.onFailData).toHaveBeenCalledTimes(1);
    expect(watcher.listeners.onFailData).toHaveBeenCalledWith(
      new TimeoutError(timeout)
    );

    expect(watcher.listeners.onDone).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
  });

  test('fail effect and cancel execution execution after timeout (reactive)', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout: createStore(timeout) },
    });

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementation((arg) => setTimeout(100).then(() => fetch(arg)));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    const watcher = watchEffect(apiCallFx, scope);
    // Do not await
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
    expect(watcher.listeners.onFailData).toHaveBeenCalledTimes(1);
    expect(watcher.listeners.onFailData).toHaveBeenCalledWith(
      new TimeoutError(timeout)
    );

    expect(watcher.listeners.onDone).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
  });

  test('fail slow effect and do not canel fast request', async () => {
    const timeout = 100;

    const apiCallFx = createApiRequest({
      request,
      response,
      abort: { timeout },
    });

    // Use real fetch
    const fetchMock = jest
      .fn()
      .mockImplementationOnce((arg) => setTimeout(100).then(() => fetch(arg)))
      .mockImplementationOnce(() => new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    const watcher = watchEffect(apiCallFx, scope);

    // Do not await
    allSettled(apiCallFx, { scope, params: {} });
    allSettled(apiCallFx, { scope, params: {} });

    await setTimeout(timeout + 10);

    // Cancell first slow request
    expect(fetchMock.mock.calls[0][0].signal.aborted).toBeTruthy();
    expect(watcher.listeners.onFail).toBeCalledTimes(1);
    expect(watcher.listeners.onFailData).toBeCalledWith(new TimeoutError(timeout));

    // Do not cancel second fast request
    expect(fetchMock.mock.calls[1][0].signal.aborted).toBeTruthy();
    expect(watcher.listeners.onDone).toBeCalledTimes(1);
  });
});
