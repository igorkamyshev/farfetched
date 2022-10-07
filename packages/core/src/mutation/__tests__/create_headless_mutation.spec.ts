import { allSettled, fork } from 'effector';
import { watchRemoteOperation } from '@farfetched/test-utils';
import { describe, test, expect, vi } from 'vitest';

import { createHeadlessMutation } from '../create_headless_mutation';
import { unknownContract } from '../../contract/unknown_contract';
import { identity } from '../../misc/identity';

describe('createHeadlessMutation', () => {
  test('start triggers executeFx', async () => {
    const mutation = createHeadlessMutation({
      contract: unknownContract,
      mapData: identity,
    });

    const mockFn = vi.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope, params: 42 });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(42);
  });

  test('finished.success triggers after executeFx.done', async () => {
    const mutation = createHeadlessMutation({
      contract: unknownContract,
      mapData: identity,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, vi.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(listeners.onSuccess).toHaveBeenCalledTimes(1);
    expect(listeners.onSuccess).toHaveBeenCalledWith({ params: 42, data: 42 });

    expect(listeners.onSkip).not.toHaveBeenCalled();
    expect(listeners.onFailure).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith({ params: 42 });
  });

  test('skip disabled mutation', async () => {
    const mutation = createHeadlessMutation({
      contract: unknownContract,
      enabled: false,
      mapData: identity,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, vi.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(scope.getState(mutation.$enabled)).toBe(false);
    expect(listeners.onSkip).toHaveBeenCalledTimes(1);
    expect(listeners.onSkip).toHaveBeenCalledWith({ params: 42 });
    expect(listeners.onSuccess).not.toHaveBeenCalled();
    expect(listeners.onFailure).not.toHaveBeenCalled();
  });

  test('fail for invalid contract', async () => {
    const mutation = createHeadlessMutation({
      contract: {
        isData: (_: any): _ is any => false,
        getErrorMessages: () => ['Test error'],
      },
      mapData: identity,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, vi.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(listeners.onFailure).toHaveBeenCalledTimes(1);
    expect(listeners.onFailure).toHaveBeenCalledWith({
      params: 42,
      error: {
        errorType: 'INVALID_DATA',
        explanation:
          'Response was considered as invalid against a given contract',
        validationErrors: ['Test error'],
      },
    });
  });

  test('fail on validation fail', async () => {
    const mutation = createHeadlessMutation({
      contract: unknownContract,
      validate: (_: any) => ['Test error'],
      mapData: identity,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, vi.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(listeners.onFailure).toHaveBeenCalledTimes(1);
    expect(listeners.onFailure).toHaveBeenCalledWith({
      params: 42,
      error: {
        errorType: 'INVALID_DATA',
        explanation:
          'Response was considered as invalid against a given contract',
        validationErrors: ['Test error'],
      },
    });
  });

  test('use mapped data', async () => {
    const mutation = createHeadlessMutation({
      contract: unknownContract,
      mapData: (data) => (data as any) + 1,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, vi.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(listeners.onSuccess).toHaveBeenCalledTimes(1);
    expect(listeners.onSuccess).toHaveBeenCalledWith({ params: 42, data: 43 });
  });
});
