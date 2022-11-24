import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { createJsonQuery } from '../../query/create_json_query';
import { cache } from '../cache';

describe('cache', () => {
  test('with initialData', () => {
    const withInitialData = createJsonQuery({
      initialData: [],
      request: {
        method: 'GET',
        url: 'https://some.url',
      },
      response: {
        contract: {} as Contract<unknown, []>,
      },
    });

    expectTypeOf(cache(withInitialData)).toBeVoid();
  });

  test('no initialData', () => {
    const withInitialData = createJsonQuery({
      request: {
        method: 'GET',
        url: 'https://some.url',
      },
      response: {
        contract: {} as Contract<unknown, []>,
      },
    });

    expectTypeOf(cache(withInitialData)).toBeVoid();
  });
});
