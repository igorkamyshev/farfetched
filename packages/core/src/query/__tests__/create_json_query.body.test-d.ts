import { describe, test } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { Contract } from '../../contract/type';

describe('createJsonQuery body', () => {
  const response = {
    contract: {} as Contract<unknown, unknown>,
    mapData: <T>({ result }: { result: T }) => result,
  };
  const url = 'http://api.salo.com';

  test('no body in get', () => {
    const query1 = createJsonQuery({
      request: { url, method: 'GET' },
      response,
    });

    const query2 = createJsonQuery({
      // @ts-expect-error body is not allowed in GET request
      request: { url, method: 'GET', body: {} },
      response,
    });
  });

  test('body in post', () => {
    const query1 = createJsonQuery({
      request: { url, method: 'POST', body: {} },
      response,
    });

    const query2 = createJsonQuery({
      request: { url, method: 'POST' },
      response,
    });
  });
});
