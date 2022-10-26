import { allSettled, fork } from 'effector';
import { describe, test, vi, expect } from 'vitest';
import { firstArg } from '@farfetched/test-utils';

import { withFactory } from '../../../misc/sid';
import { createQuery } from '../../../query/create_query';
import { enrichStartWithKey } from '../key';

describe('key, without sourced', () => {
  test('exception for query without sid', () => {
    const query = createQuery({
      handler: async (p: void) => null,
    });

    expect(() => {
      enrichStartWithKey(query);
    }).toThrowErrorMatchingInlineSnapshot('"Query does not have sid, which is required for caching, read more https://farfetched.pages.dev/recipes/sids.html"');
  });

  test('different keys for different Queries', async () => {
    const firstQuery = withFactory({
      fn: () => createQuery({ handler: async (p: void) => 1 }),
      sid: '1',
    });
    const secondQuery = withFactory({
      fn: () => createQuery({ handler: async (p: void) => 2 }),
      sid: '2',
    });

    const startFirstWithKey = enrichStartWithKey(firstQuery);
    const startSecondWithKey = enrichStartWithKey(secondQuery);

    const firstListener = vi.fn();
    const secondListener = vi.fn();

    startFirstWithKey.watch(firstListener);
    startSecondWithKey.watch(secondListener);

    const scope = fork();

    await allSettled(firstQuery.start, { scope });
    await allSettled(secondQuery.start, { scope });

    expect(firstArg(firstListener, 0).key.length).toBeGreaterThanOrEqual(1);
    expect(firstArg(secondListener, 0).key.length).toBeGreaterThanOrEqual(1);

    expect(firstArg(firstListener, 0).key).not.toBe(
      firstArg(secondListener, 0).key
    );
  });

  test('different keys for different params', async () => {
    const query = withFactory({
      fn: () => createQuery({ handler: async (p: number) => 1 }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();

    startWithKey.watch(listener);

    const scope = fork();

    await allSettled(query.start, { scope, params: 1 });
    await allSettled(query.start, { scope, params: 2 });

    expect(firstArg(listener, 0).key.length).toBeGreaterThanOrEqual(1);
    expect(firstArg(listener, 1).key.length).toBeGreaterThanOrEqual(1);

    expect(firstArg(listener, 0).key).not.toBe(firstArg(listener, 1).key);
  });

  test('same keys for same params', async () => {
    const query = withFactory({
      fn: () => createQuery({ handler: async (p: number) => 1 }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();

    startWithKey.watch(listener);

    const scope = fork();

    await allSettled(query.start, { scope, params: 1 });
    await allSettled(query.start, { scope, params: 1 });

    expect(firstArg(listener, 0).key.length).toBeGreaterThanOrEqual(1);
    expect(firstArg(listener, 1).key.length).toBeGreaterThanOrEqual(1);

    expect(firstArg(listener, 0).key).toBe(firstArg(listener, 1).key);
  });

  test('same keys for no params', async () => {
    const query = withFactory({
      fn: () => createQuery({ handler: async (p: void) => 1 }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();

    startWithKey.watch(listener);

    const scope = fork();

    await allSettled(query.start, { scope });
    await allSettled(query.start, { scope });

    expect(firstArg(listener, 0).key.length).toBeGreaterThanOrEqual(1);
    expect(firstArg(listener, 1).key.length).toBeGreaterThanOrEqual(1);

    expect(firstArg(listener, 0).key).toBe(firstArg(listener, 1).key);
  });
});
