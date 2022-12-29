import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../../fetch/fetch';
import { createJsonQuery } from '../create_json_query';
import { unknownContract } from '../../contract/unknown_contract';
import { abortError } from '../../errors/create_error';

describe('createJsonQuery concurrency.strategy', () => {
  test('abort inflight requests by default', async () => {
    const query = createJsonQuery({
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    const firstResponse = { first: 1 };
    const secondResponse = { second: 2 };

    // We have to mock base fetchFx because of deep-bounding of abortion logic
    const requestMock = vi
      .fn()
      .mockImplementationOnce(() =>
        setTimeout(1000).then(() => new Response(JSON.stringify(firstResponse)))
      )
      .mockImplementationOnce(() =>
        setTimeout(1).then(() => new Response(JSON.stringify(secondResponse)))
      );

    const scope = fork({
      handlers: [[fetchFx, requestMock]],
    });

    const watcher = watchRemoteOperation(query, scope);

    // Do not wait
    allSettled(query.start, { scope });

    await allSettled(query.start, { scope });

    expect(requestMock).toHaveBeenCalledTimes(2);
    expect(watcher.listeners.onFinally).toBeCalledTimes(2);

    expect(watcher.listeners.onFailure).toBeCalledWith(
      expect.objectContaining({
        params: undefined,
        error: abortError(),
      })
    );

    expect(watcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(watcher.listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({ result: secondResponse })
    );
  });

  test('skip next requests with concurrency.strategy TAKE_EVERY', async () => {
    const query = createJsonQuery({
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
      concurrency: { strategy: 'TAKE_EVERY' },
    });

    const firstResponse = { first: 1 };
    const secondResponse = { second: 2 };

    // We have to mock base fetchFx because of deep-bounding of abortion logic
    const requestMock = vi
      .fn()
      .mockImplementationOnce(() =>
        setTimeout(1000).then(() => new Response(JSON.stringify(firstResponse)))
      )
      .mockImplementationOnce(() =>
        setTimeout(1).then(() => new Response(JSON.stringify(secondResponse)))
      );

    const scope = fork({
      handlers: [[fetchFx, requestMock]],
    });

    const watcher = watchRemoteOperation(query, scope);

    // Do not wait
    allSettled(query.start, { scope });

    await allSettled(query.start, { scope });

    expect(requestMock).toHaveBeenCalledTimes(2);
    expect(watcher.listeners.onFinally).toBeCalledTimes(2);
    expect(watcher.listeners.onFailure).not.toHaveBeenCalled();
    expect(watcher.listeners.onSuccess).toBeCalledTimes(2);
  });

  test('ignore next requests with concurrency.strategy TAKE_FIRST', async () => {
    const query = createJsonQuery({
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
      concurrency: { strategy: 'TAKE_FIRST' },
    });

    const firstResponse = { first: 1 };
    const secondResponse = { second: 2 };

    // We have to mock base fetchFx because of deep-bounding of abortion logic
    const requestMock = vi
      .fn()
      .mockImplementationOnce(() =>
        setTimeout(1000).then(() => new Response(JSON.stringify(firstResponse)))
      )
      .mockImplementationOnce(() =>
        setTimeout(1).then(() => new Response(JSON.stringify(secondResponse)))
      );

    const scope = fork({
      handlers: [[fetchFx, requestMock]],
    });

    const watcher = watchRemoteOperation(query, scope);

    // Do not wait
    allSettled(query.start, { scope });

    await allSettled(query.start, { scope });

    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(watcher.listeners.onFinally).toBeCalledTimes(2);

    expect(watcher.listeners.onFailure).toBeCalledWith(
      expect.objectContaining({
        params: undefined,
        error: abortError(),
      })
    );

    expect(watcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(watcher.listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({ result: firstResponse })
    );
  });

  test('cancel all by external clock', async () => {
    const abort = createEvent();

    const query = createJsonQuery({
      request: { method: 'GET', url: 'https://api.salo.com' },
      response: { contract: unknownContract },
      concurrency: { abort },
    });

    const scope = fork({
      handlers: [
        [
          // We have to mock fetchFx because executeFx contains cancellation logic
          fetchFx,
          vi.fn().mockImplementation(async () => {
            await setTimeout(100);
            throw new Error('cannot');
          }),
        ],
      ],
    });

    const { listeners } = watchRemoteOperation(query, scope);

    allSettled(query.start, { scope });
    await allSettled(abort, { scope });

    expect(listeners.onFailure).toBeCalledTimes(1);
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({ error: abortError() })
    );
  });
});
