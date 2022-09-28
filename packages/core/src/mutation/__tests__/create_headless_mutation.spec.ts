import { allSettled, fork } from 'effector';
import { watchRemoteOperation } from '@farfetched/test-utils';

import { createHeadlessMutation } from '../create_headless_mutation';

describe('createHeadlessMutation', () => {
  test('start triggers executeFx', async () => {
    const mutation = createHeadlessMutation({});

    const mockFn = jest.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope, params: 42 });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(42);
  });

  test('finished.success triggers after executeFx.done', async () => {
    const mutation = createHeadlessMutation({});

    const scope = fork({
      handlers: [[mutation.__.executeFx, jest.fn((p) => p)]],
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
      enabled: false,
    });

    const scope = fork({
      handlers: [[mutation.__.executeFx, jest.fn((p) => p)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope, params: 42 });

    expect(scope.getState(mutation.$enabled)).toBe(false);
    expect(listeners.onSkip).toHaveBeenCalledTimes(1);
    expect(listeners.onSkip).toHaveBeenCalledWith({ params: 42 });
  });
});
