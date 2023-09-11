import { describe, test, vi, expect } from 'vitest';
import { allSettled, createEvent, createStore, fork } from 'effector';

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

    expect(handler).toBeCalledTimes(0);
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

    expect(handler).toBeCalledTimes(0);
    expect(isTimeoutError({ error: scope.getState(query.$error) })).toBe(true);
  });
});
