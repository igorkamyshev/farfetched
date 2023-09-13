import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createStore, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { createDefer } from '../../libs/lohyphen';
import { createRemoteOperation } from '../create_remote_operation';
import { isAbortError } from '../../errors/guards';

const defaultConfig = {
  name: 'test',
  mapData: (v: any) => v,
  meta: null,
  kind: 'test',
  contract: unknownContract,
};

describe('createRemoteOperation, disable in-flight', () => {
  test('emit skip with success in handler', async () => {
    const defer = createDefer();

    const $enabled = createStore(true);

    const operation = createRemoteOperation({
      ...defaultConfig,
      enabled: $enabled,
    });
    operation.__.executeFx.use(() => defer.promise);

    const scope = fork();

    const { listeners } = watchRemoteOperation(operation, scope);

    allSettled(operation.start, { scope, params: 1 });
    allSettled($enabled, { scope, params: false });

    defer.resolve({});

    await allSettled(scope);

    expect(listeners.onSkip).toBeCalledTimes(1);
    expect(listeners.onSkip).toBeCalledWith(
      expect.objectContaining({ params: 1 })
    );
    expect(listeners.onSuccess).not.toBeCalled();
  });

  test('emit skip with error in handler', async () => {
    const defer = createDefer();

    const $enabled = createStore(true);

    const operation = createRemoteOperation({
      ...defaultConfig,
      enabled: $enabled,
    });
    operation.__.executeFx.use(() => defer.promise);

    const scope = fork();

    const { listeners } = watchRemoteOperation(operation, scope);

    allSettled(operation.start, { scope, params: 1 });
    allSettled($enabled, { scope, params: false });

    defer.reject({});

    await allSettled(scope);

    expect(listeners.onSkip).toBeCalledTimes(1);
    expect(listeners.onSkip).toBeCalledWith(
      expect.objectContaining({ params: 1 })
    );
    expect(listeners.onFailure).not.toBeCalled();
  });

  test('$status changes on stages', async () => {
    const executorFirstDefer = createDefer();
    const executorSecondDefer = createDefer();

    const operation = createRemoteOperation({
      ...defaultConfig,
    });

    const scope = fork({
      handlers: [
        [
          operation.__.executeFx,
          vi
            .fn()
            .mockImplementationOnce(() => executorFirstDefer.promise)
            .mockImplementationOnce(() => executorSecondDefer.promise),
        ],
      ],
    });

    expect(scope.getState(operation.$status)).toBe('initial');
    expect(scope.getState(operation.$idle)).toBeTruthy();
    expect(scope.getState(operation.$pending)).toBeFalsy();
    expect(scope.getState(operation.$failed)).toBeFalsy();
    expect(scope.getState(operation.$succeeded)).toBeFalsy();
    expect(scope.getState(operation.$finished)).toBeFalsy();

    // do not await
    allSettled(operation.start, { scope, params: 42 });

    expect(scope.getState(operation.$status)).toBe('pending');
    expect(scope.getState(operation.$idle)).toBeFalsy();
    expect(scope.getState(operation.$pending)).toBeTruthy();
    expect(scope.getState(operation.$failed)).toBeFalsy();
    expect(scope.getState(operation.$succeeded)).toBeFalsy();
    expect(scope.getState(operation.$finished)).toBeFalsy();

    executorFirstDefer.resolve('result');
    await allSettled(scope);

    expect(scope.getState(operation.$status)).toBe('done');
    expect(scope.getState(operation.$idle)).toBeFalsy();
    expect(scope.getState(operation.$pending)).toBeFalsy();
    expect(scope.getState(operation.$failed)).toBeFalsy();
    expect(scope.getState(operation.$succeeded)).toBeTruthy();
    expect(scope.getState(operation.$finished)).toBeTruthy();

    // do not await
    allSettled(operation.start, { scope, params: 42 });

    expect(scope.getState(operation.$status)).toBe('pending');
    expect(scope.getState(operation.$idle)).toBeFalsy();
    expect(scope.getState(operation.$pending)).toBeTruthy();
    expect(scope.getState(operation.$failed)).toBeFalsy();
    expect(scope.getState(operation.$succeeded)).toBeFalsy();
    expect(scope.getState(operation.$finished)).toBeFalsy();

    executorSecondDefer.reject(new Error('error'));
    await allSettled(scope);

    expect(scope.getState(operation.$status)).toBe('fail');
    expect(scope.getState(operation.$idle)).toBeFalsy();
    expect(scope.getState(operation.$pending)).toBeFalsy();
    expect(scope.getState(operation.$failed)).toBeTruthy();
    expect(scope.getState(operation.$succeeded)).toBeFalsy();
    expect(scope.getState(operation.$finished)).toBeTruthy();
  });
});

describe('RemoteOperation.__.lowLevelAPI.executeCalled', async () => {
  test('Call object is emitted', async () => {
    const callObjectEmitted = vi.fn();
    const operation = createRemoteOperation({
      ...defaultConfig,
    });
    operation.__.executeFx.use(() => Promise.resolve({}));
    const scope = fork();
    createWatch({
      unit: operation.__.lowLevelAPI.executeCalled,
      scope,
      fn: callObjectEmitted,
    });

    await allSettled(operation.start, { scope, params: 42 });

    expect(callObjectEmitted).toBeCalledTimes(1);
    expect(callObjectEmitted).toBeCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        abort: expect.any(Function),
      })
    );
  });

  test('Call object may abort operation early and will throw abortError by default', async () => {
    const operation = createRemoteOperation({
      ...defaultConfig,
    });
    operation.__.executeFx.use(() => Promise.resolve({}));

    const scope = fork();
    createWatch({
      unit: operation.__.lowLevelAPI.executeCalled,
      scope,
      fn: ({ abort }) => abort(),
    });

    const operationFailed = vi.fn();

    createWatch({
      unit: operation.finished.failure,
      scope,
      fn: operationFailed,
    });

    await allSettled(operation.start, { scope, params: 42 });

    expect(operationFailed).toBeCalledTimes(1);
    expect(isAbortError(operationFailed.mock.calls[0][0])).toBe(true);
  });

  test('Call object abort does not affect other pending calls', async () => {
    const operation = createRemoteOperation({
      ...defaultConfig,
    });
    operation.__.executeFx.use(() => Promise.resolve({}));

    const scope = fork();
    let count = 0;
    createWatch({
      unit: operation.__.lowLevelAPI.executeCalled,
      scope,
      fn: ({ abort }) => {
        count++;
        if (count === 2) {
          abort();
        }
      },
    });

    const operationFinished = vi.fn();

    createWatch({
      unit: operation.finished.finally,
      scope,
      fn: (f) =>
        operationFinished({
          params: f.params,
          status: f.status,
          error: (f as { error: unknown }).error,
        }),
    });

    allSettled(operation.start, { scope, params: 42 });
    allSettled(operation.start, { scope, params: 43 }); // will be aborted
    allSettled(operation.start, { scope, params: 44 });

    await allSettled(scope);

    expect(operationFinished).toBeCalledTimes(3);
    expect(operationFinished.mock.calls.map(([arg]) => arg))
      .toMatchInlineSnapshot(`
      [
        {
          "error": {
            "errorType": "ABORT",
            "explanation": "Request was cancelled due to concurrency policy",
          },
          "params": 43,
          "status": "fail",
        },
        {
          "error": undefined,
          "params": 42,
          "status": "done",
        },
        {
          "error": undefined,
          "params": 44,
          "status": "done",
        },
      ]
    `);
  });

  test('Call objects are always in "finished" status for sync handlers', async () => {
    /**
     * Sync handler cannot be aborted early, since for the "rest of the world"
     * its execution is instant
     *
     * Call objects in that case are always "finished"
     */

    const callObjectEmitted = vi.fn();

    const operation = createRemoteOperation({
      ...defaultConfig,
    });
    operation.__.executeFx.use(() => ({}));

    const scope = fork();

    createWatch({
      unit: operation.__.lowLevelAPI.executeCalled,
      scope,
      fn: callObjectEmitted,
    });

    await allSettled(operation.start, { scope, params: 42 });

    expect(callObjectEmitted).toBeCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        abort: expect.any(Function),
        status: 'finished',
      })
    );
  });

  test('Cannot abort calls after operation is finished', async () => {
    const operation = createRemoteOperation({
      ...defaultConfig,
    });
    operation.__.executeFx.use(() => Promise.resolve({}));

    const scope = fork();

    createWatch({
      unit: operation.__.lowLevelAPI.executeCalled,
      scope,
      fn: ({ abort }) => {
        setTimeout(() => {
          abort();
        }, 10);
      },
    });

    const operationFinished = vi.fn();

    createWatch({
      unit: operation.finished.finally,
      scope,
      fn: (f) =>
        operationFinished({
          params: f.params,
          status: f.status,
          error: (f as { error: unknown }).error,
        }),
    });

    await allSettled(operation.start, { scope, params: 42 });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(operationFinished).toBeCalledTimes(1);
    expect(operationFinished.mock.calls.map(([arg]) => arg))
      .toMatchInlineSnapshot(`
      [
        {
          "error": undefined,
          "params": 42,
          "status": "done",
        },
      ]
    `);
  });
});
