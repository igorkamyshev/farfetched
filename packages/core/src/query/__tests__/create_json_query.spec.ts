import { describe, test, expect } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { isQuery } from '../type';

describe('createJsonQuery', () => {
  // Does not matter
  const response = {
    contract: {
      isData: (raw: unknown): raw is unknown => true,
      getErrorMessages: () => [],
    },
    mapData: <T>(v: T) => v,
  };

  // Does not matter
  const request = {
    url: 'http://api.salo.com',
    method: 'GET' as const,
  };

  test('isQuery', () => {
    const query = createJsonQuery({
      request,
      response,
    });

    expect(isQuery(query)).toBeTruthy();
  });
});
