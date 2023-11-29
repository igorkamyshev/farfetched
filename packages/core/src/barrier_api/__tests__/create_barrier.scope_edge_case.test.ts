import { allSettled, createStore, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect } from 'vitest';

import { createBarrier } from '../create_barrier';

describe('createBarrier, edge case with scopes', () => {
  test.concurrent(
    'mutex of barriers in different scopes does not overlap',
    async () => {
      const $barrierActive = createStore(true, { sid: 'barrier' });

      const barrier = createBarrier({ active: $barrierActive });

      const scopeNoBarrier = fork({ values: [[$barrierActive, false]] });
      const scopeBarrier = fork({ values: [[$barrierActive, true]] });

      allSettled(barrier.__.touch, { scope: scopeBarrier });
      await setTimeout(1);
      expect(scopeBarrier.getState(barrier.__.$mutex)?.isLocked).toBeTruthy();
      expect(scopeNoBarrier.getState(barrier.__.$mutex)?.isLocked).toBeFalsy();

      await allSettled(barrier.__.touch, { scope: scopeNoBarrier });
      expect(scopeBarrier.getState(barrier.__.$mutex)?.isLocked).toBeTruthy();
      expect(scopeNoBarrier.getState(barrier.__.$mutex)?.isLocked).toBeFalsy();
    }
  );
});
