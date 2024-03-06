import { describe, test, vi, expect, beforeAll, afterAll } from 'vitest';
import { allSettled, createWatch, fork } from 'effector';

import { createQuery } from '../../query/create_query';
import { timeout } from '../timeout';
import { isTimeoutError } from '../../errors/guards';
import { setTimeout } from 'timers/promises';
import { createDefer } from '../../libs/lohyphen';
import { onAbort } from '../../remote_operation/on_abort';

describe('timeout(query, time)', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('timeout(query, number)', async () => {
    const handler = vi.fn(createHandler(130));

    const query = createQuery({
      handler,
    });

    timeout(query, { after: 100 });

    const scope = fork();

    allSettled(query.refresh, { scope, params: undefined });

    vi.advanceTimersByTime(100);

    await allSettled(scope);

    expect(handler).toBeCalledTimes(1);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
    expect((scope.getState(query.$error) as { timeout: number }).timeout).toBe(
      100
    );
  });

  test('timeout(query, human-readable)', async () => {
    const handler = vi.fn(createHandler(130));
    const query = createQuery({
      handler,
    });

    timeout(query, { after: '100ms' });

    const scope = fork();

    allSettled(query.refresh, { scope, params: undefined });

    vi.advanceTimersByTime(100);

    await allSettled(scope);

    expect(handler).toBeCalledTimes(1);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
    expect((scope.getState(query.$error) as { timeout: number }).timeout).toBe(
      100
    );
  });

  test('timeout does not leave hanging promise if call is finished before timeout', async () => {
    const handler = vi.fn(createHandler(50));
    const query = createQuery({
      handler,
    });

    timeout(query, { after: 1000 });

    const scope = fork();
    const start = Date.now();
    allSettled(query.refresh, { scope, params: undefined });

    vi.advanceTimersByTime(50);

    await allSettled(scope);
    const end = Date.now() - start;

    expect(end).toBeLessThan(500);
    expect(handler).toBeCalledTimes(1);
    expect(scope.getState(query.$error)).toBe(null);
  });

  // TODO: this is flaky buggy test, should be fixed
  test.skip('multiple calls of timeout-ed queries does not affect each other', async () => {
    let count = 0;
    const handler = vi.fn(async () => {
      const defer = createDefer();

      onAbort(() => defer.reject());

      count++;

      const ms = count === 2 ? 151 : 50;

      await setTimeout(ms);

      defer.resolve(null);

      return defer.promise;
    });
    const query = createQuery({
      handler,
    });

    timeout(query, { after: '150ms' });

    const queryTimeouted = vi.fn();

    const scope = fork();

    createWatch({
      unit: query.finished.failure,
      scope,
      fn: queryTimeouted,
    });

    allSettled(query.start, { scope, params: undefined });
    allSettled(query.start, { scope, params: undefined });
    allSettled(query.start, { scope, params: undefined });

    await allSettled(scope);

    expect(handler).toBeCalledTimes(3);
    expect(queryTimeouted).toBeCalledTimes(1);
    expect(isTimeoutError(queryTimeouted.mock.calls[0][0])).toBe(true);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
    expect((scope.getState(query.$error) as { timeout: number }).timeout).toBe(
      150
    );
  });
});

function createHandler(waitTime: number) {
  return async () => {
    const defer = createDefer();

    onAbort(() => defer.reject());

    await setTimeout(waitTime);

    defer.resolve(null);

    return defer.promise;
  };
}
