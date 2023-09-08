import { describe, test } from 'vitest';

import { type Contract } from '../../contract/type';
import { createStore } from 'effector';
import { createJsonMutation } from '../create_json_mutation';
import { sourced } from '../../libs/patronus';

describe('createJsonQuery query', () => {
  const response = {
    contract: {} as Contract<unknown, unknown>,
    mapData: <T>({ result }: { result: T }) => result,
  };
  const url = 'http://api.salo.com';

  test('allow string as query field', () => {
    createJsonMutation({
      request: { url, method: 'GET', query: 'foo[]=1&foo[]=2&foo[]=3' },
      response,
    });

    createJsonMutation({
      request: {
        url,
        method: 'GET',
        query: () => 'foo[]=1&foo[]=2&foo[]=3',
      },
      response,
    });

    createJsonMutation({
      request: {
        url,
        method: 'GET',
        query: sourced({
          source: createStore(1),
          fn: () => 'foo[]=1&foo[]=2&foo[]=3',
        }),
      },
      response,
    });
  });
});
