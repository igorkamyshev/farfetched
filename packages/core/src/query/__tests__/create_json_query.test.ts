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
    mapData: ({ result }) => result,
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

  test('use initialData as initial $data', async () => {
    const query = createJsonQuery({
      initialData: 14,
      request,
      response,
    });

    expect(query.$data.getState()).toBe(14);
  });
});
