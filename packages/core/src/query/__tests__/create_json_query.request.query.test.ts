import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { unknownContract } from '../../contract/unknown_contract';

describe('remote_data/query/json.request.query', () => {
  // Other cases of sourced types are covered in sourced tests
  test('query as a function of params and source', async () => {
    const fetchMock = vi.fn();

    const $source = createStore(12);

    const query = createJsonQuery({
      response: { contract: unknownContract },
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
        query: {
          source: $source,
          fn: (param, source) => {
            return { at: `${param}_${source}` };
          },
        },
      },
      params: declareParams<string>(),
    });

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    await allSettled(query.start, { scope, params: 'today' });

    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        query: { at: 'today_12' },
      })
    );

    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(2);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        query: { at: 'next week_12' },
      })
    );

    await allSettled($source, { scope, params: 42 });
    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(3);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        query: { at: 'next week_42' },
      })
    );
  });
});
