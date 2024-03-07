import { describe, test, expectTypeOf } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { Query } from '../type';
import { createJsonQuery } from '../create_json_query';
import { JsonApiRequestError } from '../../fetch/api';

describe('createJsonQuery', () => {
  test('allow to pass credentials', () => {
    const mutation = createJsonQuery({
      request: {
        url: 'https://salo.com',
        method: 'GET',
        credentials: 'same-origin',
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutation).toEqualTypeOf<
      Query<void, unknown, JsonApiRequestError>
    >();
  });

  test('allow to pass undefined in optional property headers, issue #438', () => {
    const query = createJsonQuery({
      request: {
        url: 'https://salo.com',
        method: 'GET',
        headers: Math.random() > 0 ? {} : undefined,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<void, unknown, JsonApiRequestError>
    >();
  });

  test('allow to pass undefined in optional property credentials, issue #438', () => {
    const query = createJsonQuery({
      request: {
        url: 'https://salo.com',
        method: 'GET',
        credentials: Math.random() > 0 ? 'same-origin' : undefined,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<void, unknown, JsonApiRequestError>
    >();
  });
});
