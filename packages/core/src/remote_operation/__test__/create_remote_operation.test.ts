import { allPrevSettled, watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect } from 'vitest';

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

    await allPrevSettled(scope);

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

    await allPrevSettled(scope);

    expect(listeners.onSkip).toBeCalledTimes(1);
    expect(listeners.onSkip).toBeCalledWith(
      expect.objectContaining({ params: 1 })
    );
    expect(listeners.onFailure).not.toBeCalled();
  });
});
