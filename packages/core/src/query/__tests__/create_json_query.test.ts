import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
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

  test('pass credentials to fetch', async () => {
    const mutation = createJsonQuery({
      request: {
        method: 'GET',
        url: 'https://api.salo.com',
        credentials: 'omit',
      },
      response: { contract: unknownContract },
    });

    const fetchMock = vi.fn().mockImplementation(async () => {
      throw new Error('cannot');
    });

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(mutation.start, { scope });

    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ credentials: 'omit' })
    );
  });
});
