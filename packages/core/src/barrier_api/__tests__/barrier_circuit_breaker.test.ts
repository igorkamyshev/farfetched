import { describe, expect, test, vi } from 'vitest';
import { allSettled, createStore, createWatch, fork, sample } from 'effector';

import { createMutation } from '../../mutation/create_mutation';
import { createQuery } from '../../query/create_query';
import { httpError } from '../../errors/create_error';
import { isHttpErrorCode } from '../../errors/guards';
import { applyBarrier } from '../apply_barrier';
import { createBarrier } from '../create_barrier';
import { Barrier } from '../type';

describe('Barrier API', () => {
  test('barrier_circuit_breaker', async () => {
    // Setup from Recipe
    const renewTokenMutation = createMutation({
      async handler(_: void) {
        return 1;
      },
    });

    const buggyQuery = createQuery({
      async handler() {
        throw httpError({
          status: 401,
          statusText: 'SORRY',
          response: 'Permanent error',
        });
      },
    });

    const authBarrier = createBarrier({
      activateOn: {
        failure: isHttpErrorCode(401),
      },
      perform: [renewTokenMutation],
    });

    applyBarrier(buggyQuery, { barrier: authBarrier });

    function barrierCircuitBreaker(
      barrier: Barrier,
      { maxAttempts }: { maxAttempts: number }
    ) {
      const $currentAttempt = createStore(0).on(
        barrier.forceDeactivate,
        (attempt) => attempt + 1
      );

      sample({
        clock: $currentAttempt,
        filter: (currentAttempt) => currentAttempt >= maxAttempts,
        target: [barrier.forceDeactivate, $currentAttempt.reinit],
      });
    }

    barrierCircuitBreaker(authBarrier, { maxAttempts: 3 });

    // Test setup
    const scope = fork();

    const performedListener = vi.fn();
    createWatch({
      unit: authBarrier.performed,
      fn: performedListener,
      scope,
    });

    const forceDeactivateListener = vi.fn();
    createWatch({
      unit: authBarrier.forceDeactivate,
      fn: forceDeactivateListener,
      scope,
    });

    await allSettled(buggyQuery.refresh, { scope });

    expect(performedListener).toBeCalledTimes(3);
    expect(forceDeactivateListener).toBeCalledTimes(1);

    expect(scope.getState(buggyQuery.$error)).toMatchInlineSnapshot(`
      {
        "errorType": "HTTP",
        "explanation": "Request was finished with unsuccessful HTTP code",
        "response": "Permanent error",
        "status": 401,
        "statusText": "SORRY",
      }
    `);
  });
});
