import { createQuery } from '@farfetched/core';
import { chainRoute, createRoute } from 'atomic-router';
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
      params: { params: 1, query: {} },
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
      params: { params: 1, query: {} },
    });

    expect(handler).toBeCalledTimes(1);
    expect(openOnListener).toBeCalledTimes(2);
    expect(cancelOnListener).not.toBeCalled();

    // Third open — execute, because of changed params
    allSettled(chain.beforeOpen, {
      scope,
      params: { params: 2, query: {} },
    });

    expect(handler).toBeCalledTimes(2);
    expect(openOnListener).toBeCalledTimes(2);
    expect(cancelOnListener).not.toBeCalled();

    secondDefer.resolve(null);
    await allSettled(scope);

    expect(openOnListener).toBeCalledTimes(3);
    expect(cancelOnListener).not.toBeCalled();
  });

  test('pass route params to query', async () => {
    const handler = vi.fn().mockImplementation(() => null);
    const query = createQuery({
      handler,
    });

    const route = createRoute<{ id: number }>();
    const chainedRoute = chainRoute({ route, ...freshChain(query) });

    const scope = fork();

    await allSettled(route.open, { scope, params: { id: 1 } });

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ id: 1 });

    await allSettled(route.open, { scope, params: { id: 2 } });

    expect(handler).toBeCalledTimes(2);
    expect(handler).toBeCalledWith({ id: 2 });
  });

  test('pass route params to query with mapping', async () => {
    const handler = vi.fn().mockImplementation(() => null);
    const query = createQuery({ handler });

    const route = createRoute<{ id: number }>();
    const chainedRoute = chainRoute({ route, ...freshChain(query, ({ params }) => params.id.toString()) });

    const scope = fork();
    await allSettled(route.open, { scope, params: { id: 1 } });
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith("1");

    await allSettled(route.open, { scope, params: { id: 2 } });
    expect(handler).toBeCalledTimes(2);
    expect(handler).toBeCalledWith("2");
  });
});
