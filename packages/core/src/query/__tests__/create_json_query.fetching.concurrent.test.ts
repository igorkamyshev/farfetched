import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../../fetch/fetch';
import { createJsonQuery } from '../create_json_query';
import { unknownContract } from '../../contract/unknown_contract';
import { abortError } from '../../errors/create_error';

describe('remote_data/query/json.fetching.concurrent', () => {
  test('abort inflight requests', async () => {
    const query = createJsonQuery({
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    const firstResponse = { first: 1 };
    const secondResponse = { second: 2 };

    // We have to mock base fetchFx because of deep-bounding of abortion logic
    const requestMock = vi
      .fn()
      .mockImplementationOnce(() =>
        setTimeout(1000).then(() => new Response(JSON.stringify(firstResponse)))
      )
      .mockImplementationOnce(() =>
        setTimeout(1).then(() => new Response(JSON.stringify(secondResponse)))
      );

    const scope = fork({
      handlers: [[fetchFx, requestMock]],
    });

    const watcher = watchRemoteOperation(query, scope);

    // Do not wait
    allSettled(query.start, { scope });

    await allSettled(query.start, { scope });

    expect(requestMock).toHaveBeenCalledTimes(2);
    expect(watcher.listeners.onFinally).toBeCalledTimes(2);

    expect(watcher.listeners.onFailure).toBeCalledWith(
      expect.objectContaining({
        params: undefined,
        error: abortError(),
      })
    );

    expect(watcher.listeners.onSuccess).toBeCalledTimes(1);
  });
});
