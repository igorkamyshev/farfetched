import { allSettled, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { createJsonMutation } from '../create_json_mutation';

describe('Mutation#started', () => {
  test('should be fired after start', async () => {
    const startedListener = vi.fn();

    const mutation = createJsonMutation({
      request: {
        method: 'GET',
        url: '/api/aborted',
      },
      response: {
        contract: unknownContract,
      },
    });

    const scope = fork({
      handlers: [[fetchFx, vi.fn()]],
    });

    createWatch({ unit: mutation.started, fn: startedListener, scope });

    await allSettled(mutation.start, { scope });
    expect(startedListener).toBeCalledTimes(1);

    await allSettled(mutation.start, { scope });
    expect(startedListener).toBeCalledTimes(2);
  });
});
