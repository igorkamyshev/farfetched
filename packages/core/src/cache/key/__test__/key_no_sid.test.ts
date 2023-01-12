import { firstArg } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { vi, describe, test, expect } from 'vitest';

import { createQuery } from '../../../query/create_query';
import { enrichStartWithKey } from '../key';

describe('Query without sid can use name for key', () => {
  test('do not throw error for uniq names', async () => {
    const query1 = createQuery({ name: '1', handler: async (_: void) => null });
    const query2 = createQuery({ name: '2', handler: async (_: void) => null });

    const start1 = enrichStartWithKey(query1);
    const start2 = enrichStartWithKey(query2);

    const listener1 = vi.fn();
    start1.watch(listener1);
    const listener2 = vi.fn();
    start2.watch(listener2);

    const scope = fork();

    await allSettled(query1.start, { scope });
    await allSettled(query2.start, { scope });

    expect(firstArg(listener1, 0).key).not.toBe(firstArg(listener2, 0).key);
  });

  test('throw error for non-uniq names', async () => {
    const query1 = createQuery({ handler: async (_: void) => null });
    const query2 = createQuery({ handler: async (_: void) => null });

    const start1 = enrichStartWithKey(query1);

    expect(() => enrichStartWithKey(query2)).toThrowErrorMatchingInlineSnapshot(
      '"Query does not have sid or uniq name, which is required for caching, read more https://farfetched.pages.dev/recipes/sids.html"'
    );
  });
});
