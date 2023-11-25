import {
  allSettled,
  createEffect,
  createStore,
  createWatch,
  fork,
} from 'effector';
import { describe, test, vi, expect } from 'vitest';
import { createBarrier } from '../create_barrier';

describe('createBarrier, active overload', () => {
  test.concurrent('$active mirror input store', async () => {
    const $active = createStore(false);

    const onActivated = vi.fn();
    const onDeactivated = vi.fn();

    const barrier = createBarrier({ active: $active });

    const scope = fork();

    createWatch({ unit: barrier.activated, scope, fn: onActivated });
    createWatch({ unit: barrier.deactivated, scope, fn: onDeactivated });

    expect(scope.getState(barrier.$active)).toBe(false);
    expect(onActivated).not.toBeCalled();
    expect(onDeactivated).not.toBeCalled();

    await allSettled($active, { scope, params: true });
    expect(scope.getState(barrier.$active)).toBe(true);
    expect(onActivated).toBeCalledTimes(1);
    expect(onDeactivated).not.toBeCalled();

    await allSettled($active, { scope, params: false });
    expect(scope.getState(barrier.$active)).toBe(false);
    expect(onActivated).toBeCalledTimes(1);
    expect(onDeactivated).toBeCalledTimes(1);
  });

  test.concurrent('perform after activation AND touch', async () => {
    const performerListener = vi.fn();

    const $active = createStore(false);
    const performer = createEffect(performerListener);

    const barrier = createBarrier({ active: $active, perform: [performer] });

    const scope = fork();

    expect(scope.getState(barrier.$active)).toBe(false);

    await allSettled($active, { scope, params: true });
    expect(performerListener).not.toBeCalled();

    await allSettled(barrier.__.touch, { scope });
    expect(performerListener).toBeCalledTimes(1);
  });
});
