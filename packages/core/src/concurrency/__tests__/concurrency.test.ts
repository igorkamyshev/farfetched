import { allSettled, createEvent, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';
import { setTimeout } from 'timers/promises';

import { createDefer } from '../../libs/lohyphen';
import { createQuery } from '../../query/create_query';
import { onAbort } from '../../remote_operation/on_abort';
import { concurrency } from '../concurrency';

describe('concurrency', async () => {
  test('cancel all pending requests on abort event', async () => {
    /* This Query never ends without abortion */
    const q = createQuery({
      async handler(_: void) {
        const defer = createDefer();

        onAbort(() => defer.reject());

        return defer.promise;
      },
    });

    const listenAborted = vi.fn();

    const abortAll = createEvent();

    concurrency(q, { abortAll });

    const scope = fork();

    createWatch({ unit: q.aborted, fn: listenAborted, scope });

    allSettled(q.start, { scope });
    allSettled(q.start, { scope });

    await allSettled(abortAll, { scope });

    expect(listenAborted).toHaveBeenCalledTimes(2);
  });

  test('cancel only first request with TAKE_LATEST starategy', async () => {
    const q = createQuery({
      async handler(id: string) {
        const defer = createDefer();

        onAbort(() => defer.reject());

        await setTimeout(1);
        defer.resolve(id);

        return defer.promise;
      },
    });

    const listenAborted = vi.fn();

    const abort = createEvent();

    concurrency(q, { strategy: 'TAKE_LATEST' });

    const scope = fork();

    createWatch({ unit: q.aborted, fn: listenAborted, scope });

    allSettled(q.start, { scope, params: '1' });
    allSettled(q.start, { scope, params: '2' });

    await allSettled(abort, { scope });

    expect(listenAborted).toHaveBeenCalledTimes(1);
    expect(listenAborted.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "error": {
              "errorType": "ABORT",
              "explanation": "Request was cancelled due to concurrency policy",
            },
            "meta": {
              "stale": false,
              "stopErrorPropagation": false,
            },
            "params": "1",
          },
        ],
      ]
    `);
  });

  test('TAKE_LATEST and 2 simultaneous requests lead to correct status, issue #426', async () => {
    const q = createQuery({
      async handler(id: string) {
        const defer = createDefer();

        onAbort(() => defer.reject());

        await setTimeout(1);
        defer.resolve(id);

        return defer.promise;
      },
    });

    concurrency(q, { strategy: 'TAKE_LATEST' });

    const scope = fork();

    allSettled(q.start, { scope, params: '1' });
    allSettled(q.start, { scope, params: '2' });

    expect(scope.getState(q.$pending)).toBeTruthy();

    await allSettled(scope);

    expect(scope.getState(q.$pending)).toBeFalsy();
  });

  test('two createQuery and two onAbort, issue #449', async () => {
    const q1Aborted = vi.fn();
    const q2Aborted = vi.fn();

    const q1 = createQuery({
      /* Will not be resolved */
      handler: async () => {
        const defer = createDefer<any>();

        onAbort(() => defer.reject());

        return defer.promise;
      },
    });

    const q2 = createQuery({
      /* Will be resolved immediately */
      handler: async () => {
        const defer = createDefer<string>();

        onAbort(() => defer.reject());

        await setTimeout(1);

        defer.resolve('Data');

        return defer.promise;
      },
    });

    const stop = createEvent();

    concurrency(q1, { abortAll: stop });

    const scope = fork();

    createWatch({ unit: q1.aborted, scope, fn: q1Aborted });
    createWatch({ unit: q2.aborted, scope, fn: q2Aborted });

    allSettled(q1.start, { scope });
    allSettled(q2.start, { scope });

    await allSettled(stop, { scope });

    expect(q1Aborted).toHaveBeenCalledTimes(1);
    expect(q2Aborted).not.toHaveBeenCalled();

    expect(scope.getState(q1.$pending)).toBeFalsy();
    expect(scope.getState(q2.$pending)).toBeFalsy();

    expect(scope.getState(q1.$error)).toEqual(null);
    expect(scope.getState(q2.$error)).toEqual(null);

    expect(scope.getState(q1.$data)).toEqual(null);
    expect(scope.getState(q2.$data)).toEqual('Data');
  });
});
