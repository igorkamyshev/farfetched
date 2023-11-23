import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../fetch';
import { createJsonApiRequest } from '../json';

describe('fetch/json.request.headers', () => {
  // Does not matter
  const request = {
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
  };

  test('add Context-Type header for POST request', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: { ...request, method: 'POST' as const },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { body: { some: 'test' } },
    });

    expect(fetchMock.mock.calls[0][0].headers).toEqual(
      new Headers({
        Accept: 'application/json',
        'content-type': 'application/json',
      })
    );
  });

  test('DO NOT add Context-Type header for GET request', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: { ...request, method: 'GET' as const },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(fetchMock.mock.calls[0][0].headers).toEqual(
      new Headers({ Accept: 'application/json' })
    );
  });
});
