import { describe, test, expect } from 'vitest';
import { chainRoute, createRoute } from 'atomic-router';
import { createBarrier } from '@farfetched/core';
import { allSettled, createStore, fork } from 'effector';

import { barrierChain } from '../barrier';

describe('barrierChain', () => {
  test.concurrent(
    'route opens immediately if barrier is not active',
    async () => {
      const $active = createStore(false);
      const barrier = createBarrier({ active: $active });

      const route = createRoute();
      const chained = chainRoute({ route, ...barrierChain(barrier) });

      const scope = fork();

      await allSettled(route.open, { scope, params: {} });

      expect(scope.getState(chained.$isOpened)).toBe(true);
    }
  );

  test.concurrent('route opens only after barrier is deactived', async () => {
    const $active = createStore(false);
    const barrier = createBarrier({ active: $active });

    const route = createRoute();
    const chained = chainRoute({ route, ...barrierChain(barrier) });

    const scope = fork();

    await allSettled($active, { scope, params: true });

    await allSettled(route.open, { scope, params: {} });

    expect(scope.getState(chained.$isOpened)).toBe(false);

    await allSettled($active, { scope, params: false });

    expect(scope.getState(chained.$isOpened)).toBe(true);
  });
});
