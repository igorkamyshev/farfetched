import { allSettled, createEvent, fork } from 'effector';
import { describe, test, expect } from 'vitest';
import { createBarrier } from '../create_barrier';

describe('createBarrier, activateOn/deactivateOn overload', () => {
  const activateOn = createEvent();
  const deactivateOn = createEvent();

  const barrier = createBarrier({ activateOn, deactivateOn });

  test.concurrent('toggles', async () => {
    const scope = fork();

    expect(scope.getState(barrier.$active)).toBe(false);

    await allSettled(activateOn, { scope });
    expect(scope.getState(barrier.$active)).toBe(true);

    await allSettled(deactivateOn, { scope });
    expect(scope.getState(barrier.$active)).toBe(false);
  });
});
