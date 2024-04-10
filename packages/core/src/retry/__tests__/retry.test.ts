import { test, describe, vi, expect } from 'vitest';
import { allSettled, createWatch, fork } from 'effector';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonMutation } from '../../mutation/create_json_mutation';
import { httpError } from '../../errors/create_error';
import { createJsonQuery } from '../../query/create_json_query';
import { fetchFx } from '../../fetch/fetch';
import { retry } from '../retry';

describe('retry', () => {
  test('does not suppress finished.failure event after all retries in case of filter', async () => {
    const m = createJsonMutation({
      request: {
        url: 'api.salo.com',
        method: 'POST',
      },
      response: {
        contract: unknownContract,
      },
    });

    retry(m, {
      times: 3,
      delay: 100,
      /* Always return false, basically disabled retry */
      filter: () => false,
    });

    const onFailure = vi.fn();

    const scope = fork({
      handlers: [
        [
          m.__.executeFx,
          () => {
            throw httpError({
              status: 400,
              statusText: 'Sorry',
              response: 'Sorry',
            });
          },
        ],
      ],
    });

    createWatch({ unit: m.finished.failure, scope, fn: onFailure });

    await allSettled(m.start, { scope });

    expect(onFailure).toBeCalledTimes(1);
  });

  test('does supress contract failure error as well, issue #459', async () => {
    const q = createJsonQuery({
      request: { url: 'https://api.salo.com', method: 'GET' },
      response: {
        contract: {
          isData(v): v is unknown {
            return false;
          },
          getErrorMessages(v) {
            return ['Failed contract'];
          },
        },
      },
    });

    retry(q, { times: 1, delay: 1 });

    const scope = fork({
      handlers: [[fetchFx, () => new Response('{"data": "ok"}')]],
    });

    const failedListener = vi.fn();
    createWatch({ unit: q.finished.failure, scope, fn: failedListener });

    const startedListener = vi.fn();
    createWatch({ unit: q.started, scope, fn: startedListener });

    await allSettled(q.start, { scope });

    expect(startedListener).toBeCalledTimes(2 /* Initial and retry */);
    expect(failedListener).toBeCalledTimes(1 /* Only latest failure */);
  });
});
