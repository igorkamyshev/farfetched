import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { unknownContract } from '../../contract/unknown_contract';

describe('remote_data/query/json.request.body', () => {
  // Other cases of sourced types are covered in sourced tests
  test('body as a function of params and source', async () => {
    const fetchMock = vi.fn();

    const $source = createStore(12);

    const query = createJsonQuery({
      params: declareParams<string>(),
      request: {
        url: 'http://api.salo.com',
        method: 'POST' as const,
        body: {
          source: $source,
          fn: (param, source) => {
            return { param, source };
          },
        },
      },
      response: { contract: unknownContract },
    });

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    await allSettled(query.start, { scope, params: 'today' });

    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        body: { param: 'today', source: 12 },
      })
    );

    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(2);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        body: { param: 'next week', source: 12 },
      })
    );

    await allSettled($source, { scope, params: 42 });
    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(3);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        body: { param: 'next week', source: 42 },
      })
    );
  });
});
