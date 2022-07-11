// TODO: jest-28
import 'isomorphic-fetch';

import { allSettled, createStore, fork } from 'effector';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('fetch/api.request.credentials', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const method = 'GET';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('pass static credentials on call to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, url, method },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: { credentials: 'omit' as const },
    });

    expect(fetchMock).toBeCalledWith(new Request(url, { credentials: 'omit' }));
  });

  test('pass static credentials on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials: 'omit' as const, method, url },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: {} });

    expect(fetchMock).toBeCalledWith(new Request(url, { credentials: 'omit' }));
  });

  test('pass reactive credentials on creation to request', async () => {
    const $credentials = createStore<RequestCredentials>('omit');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials: $credentials, method, url },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(new Request(url, { credentials: 'omit' }));

    // with new value
    await allSettled($credentials, { scope, params: 'include' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(
      new Request(url, { credentials: 'include' })
    );
  });
});
