import { allPrevSettled } from '@farfetched/test-utils';
import { allSettled, createEffect, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, vi, expect, test } from 'vitest';

import { Contract } from '../../contract/type';
import { withFactory } from '../../misc/sid';
import { createQuery } from '../../query/create_query';
import { inMemoryCache } from '../adapters/in_memory';
import { cache } from '../cache';
import { sha1 } from '../lib/hash';
import { parseTime } from '../lib/time';

describe('cache without stale', () => {
  test('use value from cache on second call', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(1000).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query, { adapter: inMemoryCache(), staleAfter: '1h' });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache
    expect(scope.getState(query.$data)).toEqual(1);
    expect(scope.getState(query.$stale)).toBeFalsy();

    await allPrevSettled(scope);

    // No refetch
    expect(handler).toBeCalledTimes(1);
  });

  test('ignore value that does not satisfy contract', async () => {
    const numberContarct: Contract<unknown, number> = {
      isData: (x): x is number => typeof x === 'number',
      getErrorMessages: () => ['Not a number'],
    };

    const query = withFactory({
      fn: () =>
        createQuery({
          effect: createEffect(() =>
            setTimeout(1000).then(() => 12 as unknown)
          ),
          contract: numberContarct,
        }),
      sid: '1',
    });

    const adapter = inMemoryCache();

    cache(query, { adapter, staleAfter: '1h' });

    const scope = fork();

    // Force push invalid value to adapter

    await allSettled(adapter.set, {
      scope,
      params: {
        key: sha1(
          query.$data.sid +
            /* params is undefined */ JSON.stringify(undefined) +
            /* sources is [] */ JSON.stringify([])
        ),
        value: JSON.stringify('random string'),
      },
    });

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
    await setTimeout(1);

    // Value from cache is not a number, did not put it to cache
    expect(scope.getState(query.$data)).toEqual(null);
    expect(scope.getState(query.$stale)).toBeFalsy();
  });

  test('mark value as stale after stale timeout', async () => {
    let index = 1;
    const handler = vi.fn(async (p: void) =>
      setTimeout(100).then(() => index++)
    );
    const query = withFactory({ fn: () => createQuery({ handler }), sid: '1' });

    cache(query, { adapter: inMemoryCache(), staleAfter: '1sec' });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toEqual(1);

    await allSettled(query.reset, { scope });
    await setTimeout(parseTime('1sec')); // wait for stale after time

    // Do not await
    allSettled(query.start, { scope });
    // But wait for next tick becuase of async adapter's nature
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
