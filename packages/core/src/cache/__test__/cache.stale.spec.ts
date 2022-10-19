import { allPrevSettled } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, vi, expect, test } from 'vitest';

import { withFactory } from '../../misc/sid';
import { createQuery } from '../../query/create_query';
import { inMemoryCache } from '../adapters/in_memory';
import { cache } from '../cache';

describe('cache', () => {
  test('use value from cache on second call', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(1000).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query, { adapter: inMemoryCache() });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope });
    await setTimeout(1);
    // Value from cache
    expect(scope.getState(query.$data)).toEqual(1);
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allPrevSettled(scope);

    // After refetch, it's new value
    expect(scope.getState(query.$data)).toEqual(2);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);
  });
});
