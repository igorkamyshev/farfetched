import { allSettled, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';
import { attachOperation } from '../../attach/attach';

import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { createJsonQuery } from '../create_json_query';
import { createQuery } from '../create_query';

describe('Query#started', () => {
  test('should be fired after start', async () => {
    const startedListener = vi.fn();

    const query = createJsonQuery({
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

    createWatch({ unit: query.started, fn: startedListener, scope });

    await allSettled(query.refresh, { scope });
    expect(startedListener).toBeCalledTimes(1);

    // Should not start Query again
    await allSettled(query.refresh, { scope });
    expect(startedListener).toBeCalledTimes(1);
  });

  test('support attachOperation, issue #305', async () => {
    const original = createQuery({ handler: vi.fn() });
    const attached = attachOperation(original);

    const originalStartedListener = vi.fn();

    const scope = fork();

    createWatch({ unit: original.started, fn: originalStartedListener, scope });

    await allSettled(attached.start, { scope, params: 100 });

    expect(originalStartedListener).toBeCalledTimes(1);
    expect(originalStartedListener).toBeCalledWith(
      expect.objectContaining({
        params: 100,
        meta: {
          stale: true,
          stopErrorPropagation: false,
        },
      })
    );
  });
});
