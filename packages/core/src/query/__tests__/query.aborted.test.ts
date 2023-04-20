import { allSettled, createEvent, createWatch, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { createJsonQuery } from '../create_json_query';

describe('Query#aborted', () => {
  test('should be fired of operation is aborted', async () => {
    const abortedListener = vi.fn();
    const failureListener = vi.fn();

    const signal = createEvent();

    const query = createJsonQuery({
      request: {
        method: 'GET',
        url: '/api/aborted',
      },
      response: {
        contract: unknownContract,
      },
      concurrency: { abort: signal },
    });

    const scope = fork({
      handlers: [[fetchFx, vi.fn(async () => setTimeout(100))]],
    });

    createWatch({ unit: query.aborted, fn: abortedListener, scope });
    createWatch({ unit: query.finished.failure, fn: failureListener, scope });

    allSettled(query.refresh, { scope });
    allSettled(signal, { scope });

    await allSettled(scope);

    expect(abortedListener).toBeCalledTimes(1);
    // TODO: enable it in 0.10
    // expect(failureListener).not.toBeCalledTimes(1);
    // expect(scope.getState(query.$status)).toBe('idle');
  });
});
