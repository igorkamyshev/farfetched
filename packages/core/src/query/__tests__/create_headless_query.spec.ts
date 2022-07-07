import { allSettled, fork } from 'effector';

import { watchQuery } from '@farfetched/test-utils';

import { createHeadlessQuery } from '../create_headless_query';
import { createDefer } from '../../misc/defer';

describe('core/createHeadlessQuery', () => {
  const query = createHeadlessQuery({ sid: 'any_string' });

  test('start triggers executeFx', async () => {
    const mockFn = jest.fn();

    const scope = fork({ handlers: [[query.__.executeFx, mockFn]] });

    await allSettled(query.start, { scope, params: 42 });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(42);
  });

  test('done.success triggers after executeFx.done', async () => {
    const scope = fork({ handlers: [[query.__.executeFx, jest.fn((p) => p)]] });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe(42);
    expect(scope.getState(query.$error)).toBeNull();
    expect(listeners.onDone).toHaveBeenCalledTimes(1);
    expect(listeners.onDone).toHaveBeenCalledWith(42);

    expect(listeners.onSkip).not.toHaveBeenCalled();
    expect(listeners.onError).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(undefined);
  });

  test('done.error triggers after executeFx.fail', async () => {
    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest.fn(() => {
            throw new Error('from mock');
          }),
        ],
      ],
    });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$error)).toEqual(new Error('from mock'));
    expect(scope.getState(query.$data)).toBeNull();

    expect(listeners.onError).toHaveBeenCalledTimes(1);
    expect(listeners.onError).toHaveBeenCalledWith(new Error('from mock'));

    expect(listeners.onDone).not.toHaveBeenCalled();
    expect(listeners.onSkip).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(undefined);
  });

  test('$status changes on stages', async () => {
    const executorFirstDefer = createDefer();
    const executorSecondDefer = createDefer();

    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest
            .fn()
            .mockImplementationOnce(() => executorFirstDefer.promise)
            .mockImplementationOnce(() => executorSecondDefer.promise),
        ],
      ],
    });

    expect(scope.getState(query.$status)).toBe('initial');
    expect(scope.getState(query.$pending)).toBeFalsy();

    // do not await
    allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$status)).toBe('pending');
    expect(scope.getState(query.$pending)).toBeTruthy();

    executorFirstDefer.resolve('result');
    await executorFirstDefer.promise;

    expect(scope.getState(query.$status)).toBe('done');
    expect(scope.getState(query.$pending)).toBeFalsy();

    // do not await
    allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$status)).toBe('pending');
    expect(scope.getState(query.$pending)).toBeTruthy();

    executorSecondDefer.reject(new Error('error'));
    await executorSecondDefer.promise.catch(() => {
      //pass
    });

    expect(scope.getState(query.$status)).toBe('fail');
    expect(scope.getState(query.$pending)).toBeFalsy();
  });

  test('re-execute', async () => {
    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest
            .fn()
            .mockResolvedValueOnce('first done')
            .mockRejectedValueOnce(new Error('first error'))
            .mockResolvedValueOnce('second done')
            .mockRejectedValueOnce(new Error('second error')),
        ],
      ],
    });

    // first done
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe('first done');
    expect(scope.getState(query.$error)).toBeNull();

    // first error
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$error)).toEqual(new Error('first error'));

    // second done
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe('second done');
    expect(scope.getState(query.$error)).toBeNull();

    // second error
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$error)).toEqual(new Error('second error'));
  });
});
