import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createEffect, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createMutation } from '../create_mutation';

describe('createMutation', () => {
  test('use function as handler', async () => {
    const handler = vi
      .fn()
      .mockResolvedValueOnce('data')
      .mockRejectedValueOnce('error');

    const mutation = createMutation({ handler });

    const scope = fork();

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(handler).toHaveBeenNthCalledWith(1, 42);
    expect(listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({ params: 42, result: 'data' })
    );

    await allSettled(mutation.start, { scope, params: 24 });
    expect(handler).toHaveBeenNthCalledWith(2, 24);
    expect(listeners.onFailure).toBeCalledWith(
      expect.objectContaining({ params: 24, error: 'error' })
    );
  });

  test('use effect as handler', async () => {
    const handler = vi
      .fn()
      .mockResolvedValueOnce('data')
      .mockRejectedValueOnce('error');

    const effect = createEffect(handler);
    const mutation = createMutation({ effect });

    const scope = fork();

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(handler).toHaveBeenNthCalledWith(1, 42);
    expect(listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({ params: 42, result: 'data' })
    );

    await allSettled(mutation.start, { scope, params: 24 });
    expect(handler).toHaveBeenNthCalledWith(2, 24);
    expect(listeners.onFailure).toBeCalledWith(
      expect.objectContaining({ params: 24, error: 'error' })
    );
  });

  test('uses contract', async () => {
    const mutation = createMutation({
      effect: createEffect(vi.fn().mockResolvedValue('data')),
      contract: {
        isData: (_: any): _ is any => false,
        getErrorMessages: () => ['Test error'],
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });
    expect(listeners.onFailure).toBeCalledWith(
      expect.objectContaining({
        params: 42,
        error: {
          errorType: 'INVALID_DATA',
          explanation:
            'Response was considered as invalid against a given contract',
          validationErrors: ['Test error'],
          response: 'data',
        },
      })
    );
  });

  test('skip disabled mutation', async () => {
    const handler = vi.fn();
    const mutation = createMutation({ handler, enabled: false });

    const scope = fork();

    await allSettled(mutation.start, { scope, params: 42 });

    expect(handler).not.toBeCalled();
  });
});
