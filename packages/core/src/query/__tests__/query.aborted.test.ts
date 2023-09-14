import { allSettled, createEvent, createWatch, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { declareParams } from '../../remote_operation/params';
import { createJsonQuery } from '../create_json_query';

describe('Query#aborted', () => {
  test('should be fired of operation is aborted after initial', async () => {
    const abortedListener = vi.fn();
    const failureListener = vi.fn();

    const signal = createEvent();

    const query = createJsonQuery({
      request: {
        method: 'GET',
        url: 'https://api.example.com/api/aborted',
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
    expect(failureListener).not.toBeCalledTimes(1);
    expect(scope.getState(query.$status)).toBe('initial'); // previous status
  });

  test('should be fired of operation is aborted after done', async () => {
    const abortedListener = vi.fn();
    const failureListener = vi.fn();

    const signal = createEvent();

    const query = createJsonQuery({
      params: declareParams<{ id: number }>(),
      request: {
        method: 'GET',
        url: ({ id }) => `https://api.example.com/api/aborted/${id}`,
      },
      response: {
        contract: unknownContract,
      },
      concurrency: { abort: signal },
    });

    const scope = fork({
      handlers: [
        [
          fetchFx,
          vi.fn(async () => setTimeout(100).then(() => new Response())),
        ],
      ],
    });

    createWatch({ unit: query.aborted, fn: abortedListener, scope });
    createWatch({ unit: query.finished.failure, fn: failureListener, scope });

    await allSettled(query.refresh, { scope, params: { id: 1 } });

    expect(scope.getState(query.$error)).toBe(null);
    expect(scope.getState(query.$status)).toBe('done');

    allSettled(query.refresh, { scope, params: { id: 2 } });
    allSettled(signal, { scope });

    await allSettled(scope);

    expect(abortedListener).toBeCalledTimes(1);
    expect(failureListener).not.toBeCalledTimes(1);
    expect(scope.getState(query.$status)).toBe('done'); // previous status
  });
});
