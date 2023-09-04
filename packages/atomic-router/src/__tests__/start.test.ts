import { createQuery } from '@farfetched/core';
import { allSettled, createStore, createWatch, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';
import { createDefer } from '../defer';
import { startChain } from '../start';

describe('startChain', () => {
  test('should start query after beforeOpen call and call openOn after success', async () => {
    const defer = createDefer();
    const handler = vi.fn().mockImplementation(() => defer.promise);
    const query = createQuery({ handler });
    const chain = startChain(query);

    const scope = fork();

    const openOnListener = vi.fn();
    createWatch({ unit: chain.openOn, fn: openOnListener, scope });
    const cancelOnListener = vi.fn();
    createWatch({ unit: chain.cancelOn, fn: cancelOnListener, scope });

    allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: {} },
    });

    expect(handler).toBeCalledTimes(1);
    expect(openOnListener).not.toBeCalled();
    expect(cancelOnListener).not.toBeCalled();

    defer.resolve(null);

    await allSettled(scope);

    expect(openOnListener).toBeCalledTimes(1);
    expect(cancelOnListener).not.toBeCalled();
  });

  test('should start query after beforeOpen call and call cancelOn after failure', async () => {
    const defer = createDefer();
    const handler = vi.fn().mockImplementation(() => defer.promise);
    const query = createQuery({ handler });
    const chain = startChain(query);

    const scope = fork();

    const openOnListener = vi.fn();
    createWatch({ unit: chain.openOn, fn: openOnListener, scope });
    const cancelOnListener = vi.fn();
    createWatch({ unit: chain.cancelOn, fn: cancelOnListener, scope });

    allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: {} },
    });

    expect(handler).toBeCalledTimes(1);
    expect(openOnListener).not.toBeCalled();
    expect(cancelOnListener).not.toBeCalled();

    defer.reject(null);

    await allSettled(scope);

    expect(openOnListener).not.toBeCalled();
    expect(cancelOnListener).toBeCalledTimes(1);
  });

  test('should start query after beforeOpen call and call cancelOn if it is disabled', async () => {
    const defer = createDefer();
    const handler = vi.fn().mockImplementation(() => defer.promise);
    const query = createQuery({ handler, enabled: createStore(false) });
    const chain = startChain(query);

    const scope = fork();

    const openOnListener = vi.fn();
    createWatch({ unit: chain.openOn, fn: openOnListener, scope });
    const cancelOnListener = vi.fn();
    createWatch({ unit: chain.cancelOn, fn: cancelOnListener, scope });

    await allSettled(chain.beforeOpen, {
      scope,
      params: { params: undefined, query: {} },
    });

    expect(handler).not.toBeCalled();
    expect(openOnListener).not.toBeCalled();
    expect(cancelOnListener).toBeCalledTimes(1);
  });
});
