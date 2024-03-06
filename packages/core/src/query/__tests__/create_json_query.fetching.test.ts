import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createJsonQuery } from '../create_json_query';

describe('remote_data/query/json.fetching', () => {
  // Does not matter
  const response = {
    contract: {
      isData: (raw: unknown): raw is unknown => true,
      getErrorMessages: () => [],
    },
    mapData: ({ result }: { result: unknown }) => result,
  };

  // Does not matter
  const request = {
    url: 'http://api.salo.com',
    method: 'GET' as const,
  };

  test('perform fetching on start', async () => {
    const requestMock = vi.fn();

    const query = createJsonQuery({
      request,
      response,
    });

    const scope = fork({
      handlers: [[query.__.executeFx, requestMock]],
    });

    await allSettled(query.start, { scope });

    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
