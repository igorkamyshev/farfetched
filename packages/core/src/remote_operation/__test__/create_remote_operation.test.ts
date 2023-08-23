import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { createDefer } from '../../libs/lohyphen';
import { createRemoteOperation } from '../create_remote_operation';

describe('createRemoteOperation, disable in-flight', () => {
  const defaultConfig = {
    name: 'test',
    mapData: (v: any) => v,
    meta: null,
    kind: 'test',
    contract: unknownContract,
  };

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
