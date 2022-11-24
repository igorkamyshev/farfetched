import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../fetch';
import { createJsonApiRequest } from '../json';

describe('fetch/json.request.body', () => {
  // Does not matter
  const request = {
    method: 'POST' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
  };

  test('serialize JSON to string', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { body: { some: 'test' } },
    });

    expect(await fetchMock.mock.calls[0][0].text()).toBe('{"some":"test"}');
  });
});
