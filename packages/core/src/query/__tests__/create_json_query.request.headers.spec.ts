import { allSettled, createStore, fork } from 'effector';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../misc/params';
import { unkownContract } from '../../contract/unkown_contract';

describe('remote_data/query/json.request.headers', () => {
  // Other cases of sourced types are covered in sourced tests
  test('headers as a function of params and source', async () => {
    const fetchMock = jest.fn();

    const $source = createStore(12);

    const query = createJsonQuery({
      response: { contract: unkownContract },
      request: {
        url: 'http://api.salo.com',
        method: 'GET' as const,
        headers: {
          source: $source,
          fn: (param, source) => {
            return { param, source: source.toString() };
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
        headers: { param: 'today', source: '12' },
      })
    );

    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(2);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        headers: { param: 'next week', source: '12' },
      })
    );

    await allSettled($source, { scope, params: 42 });
    await allSettled(query.start, { scope, params: 'next week' });

    expect(fetchMock).toBeCalledTimes(3);
    expect(fetchMock).toBeCalledWith(
      expect.objectContaining({
        headers: { param: 'next week', source: '42' },
      })
    );
  });
});
