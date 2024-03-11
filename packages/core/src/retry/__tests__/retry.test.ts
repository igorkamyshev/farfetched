import { test, describe, vi, expect } from 'vitest';
import { allSettled, createWatch, fork } from 'effector';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonMutation } from '../../mutation/create_json_mutation';
import { httpError } from '../../errors/create_error';
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
});
