import { createQuery } from '@farfetched/core';
import { allSettled, createWatch, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';
import { createDefer } from '../defer';
import { freshChain } from '../fresh';

describe('freshChain', () => {
  test('should start query after beforeOpen call and call openOn, respect $stale state', async () => {
    const firstDefer = createDefer();
    const secondDefer = createDefer();

    const handler = vi
      .fn()
      .mockImplementationOnce(() => firstDefer.promise)
      .mockImplementationOnce(() => secondDefer.promise);

    const query = createQuery({ handler });
    const chain = freshChain(query);

    const scope = fork();

    const openOnListener = vi.fn();
    createWatch({ unit: chain.openOn, fn: openOnListener, scope });
    const cancelOnListener = vi.fn();
    createWatch({ unit: chain.cancelOn, fn: cancelOnListener, scope });

    // First open — execute
    allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: {} },
    });

    expect(handler).toBeCalledTimes(1);
    expect(openOnListener).not.toBeCalled();
    expect(cancelOnListener).not.toBeCalled();

    firstDefer.resolve(null);
    await allSettled(scope);

    expect(openOnListener).toBeCalledTimes(1);
    expect(cancelOnListener).not.toBeCalled();

    // Second open — just openOp immediately
    await allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: {} },
    });

    expect(handler).toBeCalledTimes(1);
    expect(openOnListener).toBeCalledTimes(2);
    expect(cancelOnListener).not.toBeCalled();

    // Third open — execute, because of changed params
    allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: { some: 2 } },
    });

    expect(handler).toBeCalledTimes(2);
    expect(openOnListener).toBeCalledTimes(2);
    expect(cancelOnListener).not.toBeCalled();

    secondDefer.resolve(null);
    await allSettled(scope);

    expect(openOnListener).toBeCalledTimes(3);
    expect(cancelOnListener).not.toBeCalled();
  });
});
