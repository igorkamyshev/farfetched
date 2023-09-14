import { describe, test, vi, expect } from 'vitest';
import { allSettled, createWatch, fork } from 'effector';

import { createQuery } from '../../query/create_query';
import { timeout } from '../timeout';
import { isTimeoutError } from '../../errors/guards';

describe('timeout(query, time)', () => {
  test('timeout(query, number)', async () => {
    const handler = vi.fn(
      async () =>
        new Promise((r) => {
          setTimeout(r, 130);
        })
    );
    const query = createQuery({
      handler,
    });

    timeout(query, { after: 100 });

    const scope = fork();

    await allSettled(query.refresh, { scope, params: undefined });

    expect(handler).toBeCalledTimes(1);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
  });

  test('timeout(query, human-readable)', async () => {
    const handler = vi.fn(
      async () =>
        new Promise((r) => {
          setTimeout(r, 130);
        })
    );
    const query = createQuery({
      handler,
    });

    timeout(query, { after: '100ms' });

    const scope = fork();

    await allSettled(query.refresh, { scope, params: undefined });

    expect(handler).toBeCalledTimes(1);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
  });

  test('timeout does not leave hanging promise if call is finished before timeout', async () => {
    const handler = vi.fn(
      async () =>
        new Promise((r) => {
          setTimeout(r, 50);
        })
    );
    const query = createQuery({
      handler,
    });

    timeout(query, { after: 1000 });

    const scope = fork();
    const start = Date.now();
    await allSettled(query.refresh, { scope, params: undefined });
    const end = Date.now() - start;

    expect(end).toBeLessThan(500);
    expect(handler).toBeCalledTimes(1);
    expect(scope.getState(query.$error)).toBe(null);
  });

  test('multiple calls of timeout-ed queries does not affect each other', async () => {
    let count = 0;
    const handler = vi.fn(
      async () =>
        new Promise((r) => {
          count++;
          const ms = count === 2 ? 151 : 50;
          setTimeout(r, ms);
        })
    );
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
  });
});
