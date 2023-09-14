import { allSettled, createEffect, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, vi, expect } from 'vitest';

import { timeoutError } from '../../errors/create_error';
import { createDefer } from '../../libs/lohyphen';
import { createBarrier } from '../create_barrier';

describe('createBarrier, activateOn onle overload', () => {
  test.concurrent(
    'activates after activateOn.failure and deactivaes after all perform resolves',
    async () => {
      const performDeferOne = createDefer();
      const performDeferTwo = createDefer();

      const onFailure = vi.fn(() => true);

      const onPerformOne = vi.fn(() => performDeferOne.promise);
      const onPerformTwo = vi.fn(() => performDeferTwo.promise);

      const barrier = createBarrier({
        activateOn: { failure: onFailure },
        perform: [createEffect(onPerformOne), createEffect(onPerformTwo)],
      });

      const scope = fork();

      expect(scope.getState(barrier.$active)).toBe(false);

      // Do not await
      allSettled(barrier.__.operationFailed, {
        scope,
        params: { params: { id: 1 }, error: timeoutError({ timeout: 10 }) },
      });
      expect(scope.getState(barrier.$active)).toBe(true);
      expect(onFailure).toBeCalledTimes(1);
      expect(onFailure).toBeCalledWith({
        params: { id: 1 },
        error: timeoutError({ timeout: 10 }),
      });

      expect(onPerformOne).toBeCalled();
      expect(onPerformTwo).toBeCalled();

      performDeferOne.resolve(null);
      await setTimeout(1);
      expect(scope.getState(barrier.$active)).toBe(true);

      performDeferTwo.resolve(null);
      await allSettled(scope);
      expect(scope.getState(barrier.$active)).toBe(false);
    }
  );

  test.concurrent(
    'reactivation case and deactivaes after all perform resolves',
    async () => {
      const performDeferOne = createDefer();
      const performDeferTwo = createDefer();

      const onFailure = vi.fn(() => true);

      const onPerformOne = vi.fn(() => null);
      const onPerformTwo = vi
        .fn()
        .mockImplementationOnce(() => performDeferOne.promise)
        .mockImplementationOnce(() => performDeferTwo.promise);

      const barrier = createBarrier({
        activateOn: { failure: onFailure },
        perform: [createEffect(onPerformOne), createEffect(onPerformTwo)],
      });

      const scope = fork();

      expect(scope.getState(barrier.$active)).toBe(false);

      // First fail, do not await
      allSettled(barrier.__.operationFailed, {
        scope,
        params: { params: { id: 1 }, error: timeoutError({ timeout: 10 }) },
      });
      expect(scope.getState(barrier.$active)).toBe(true);

      expect(onPerformOne).toBeCalled();
      expect(onPerformTwo).toBeCalled();

      performDeferOne.resolve(null);

      await allSettled(scope);
      expect(scope.getState(barrier.$active)).toBe(false);

      //Second fail, do not await
      allSettled(barrier.__.operationFailed, {
        scope,
        params: { params: { id: 2 }, error: timeoutError({ timeout: 10 }) },
      });
      expect(scope.getState(barrier.$active)).toBe(true);

      await setTimeout(1);
      expect(scope.getState(barrier.$active)).toBe(true);

      performDeferTwo.resolve(null);
      await allSettled(scope);
      expect(scope.getState(barrier.$active)).toBe(false);
    }
  );
});
