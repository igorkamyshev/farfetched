import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, expect, test, vi } from 'vitest';

import { createQuery } from '../../query/create_query';
import { stale } from '../stale';

describe('Trigger API, stale', () => {
  test('mark Query as stale and refresh', async () => {
    const clock = createEvent();

    const executeListener = vi.fn(async (_: void) =>
      setTimeout(1).then(() => 42)
    );

    const query = createQuery({
      handler: executeListener,
    });

    stale(query, { clock });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(1);

    allSettled(clock, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(2);
  });

  test('uses params Query from params field', async () => {
    const clock = createEvent();

    const executeListener = vi.fn(async (params: string) =>
      setTimeout(1).then(() => 42)
    );

    const query = createQuery({
      handler: executeListener,
    });

    stale(query, { clock, params: () => 'from_operator' });

    const scope = fork();

    await allSettled(query.refresh, { scope, params: 'original' });

    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(1);
    expect(executeListener).toBeCalledWith('original');

    allSettled(clock, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(2);
    expect(executeListener).toBeCalledWith('from_operator');
  });
});
