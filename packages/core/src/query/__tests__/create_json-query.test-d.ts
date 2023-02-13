import { describe, test, expectTypeOf } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { Query } from '../type';
import { createJsonQuery } from '../create_json_query';
import { DefaultRequestError } from '../../fetch/api';

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
      Query<void, unknown, DefaultRequestError>
    >();
  });
});
