import { describe, test } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { Contract } from '../../contract/type';
import { createStore } from 'effector';
import { declareParams } from '../../remote_operation/params';
import { unknownContract } from '../../contract/unknown_contract';

describe('createJsonQuery query', () => {
  const response = {
    contract: {} as Contract<unknown, unknown>,
    mapData: <T>({ result }: { result: T }) => result,
  };
  const url = 'http://api.salo.com';

  test('allow string as query field', () => {
    createJsonQuery({
      request: { url, method: 'GET', query: 'foo[]=1&foo[]=2&foo[]=3' },
      response,
    });

    createJsonQuery({
      request: {
        url,
        method: 'GET',
        query: () => 'foo[]=1&foo[]=2&foo[]=3',
      },
      response,
    });

    createJsonQuery({
      request: {
        url,
        method: 'GET',
        query: { source: createStore(1), fn: () => 'foo[]=1&foo[]=2&foo[]=3' },
      },
      response,
    });
  });

  test('supports boolean field in params', () => {
    const query = createJsonQuery({
      params: declareParams<{
        id: string;
        from: number;
        to: number;
        monthly: boolean;
      }>(),
      request: {
        url,
        method: 'GET',
        query: ({ from, to, monthly }) => ({ from, to, monthly }),
      },
      response: {
        contract: unknownContract,
      },
    });
  });
});
