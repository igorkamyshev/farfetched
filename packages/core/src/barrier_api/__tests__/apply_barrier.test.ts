import { allSettled, createStore, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { watchRemoteOperation } from '@farfetched/test-utils';

import { createQuery } from '../../query/create_query';
import { applyBarrier } from '../apply_barrier';
import { createBarrier } from '../create_barrier';

describe('applyBarrier', () => {
  test.concurrent('deactivated barrier does not affect operation', async () => {
    const barrier = createBarrier({ active: createStore(false) });

    const query = createQuery({ handler: vi.fn(async (_: void) => null) });

    applyBarrier(query, { barrier });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    allSettled(query.refresh, { scope });
    expect(listeners.onStart).toBeCalled();

    await setTimeout(1);
    expect(listeners.onSuccess).toBeCalled();

    await allSettled(scope);
  });

  test.concurrent('activated barrier postpones operation', async () => {
    const $barrierActive = createStore(true);

    const barrier = createBarrier({ active: $barrierActive });

    const query = createQuery({ handler: vi.fn(async (_: void) => null) });

    applyBarrier(query, { barrier });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    allSettled(query.refresh, { scope });
    expect(listeners.onStart).toBeCalled();

    await setTimeout(1);
    expect(listeners.onSuccess).not.toBeCalled();

    await allSettled($barrierActive, { scope, params: false });
    expect(listeners.onSuccess).toBeCalled();
  });
});
