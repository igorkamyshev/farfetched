import { allSettled, createStore, fork } from 'effector';
import { expectAssignable } from 'tsd';

import { createApiRequest, HttpMethod } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.method', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    prepare: { extract: async <T>(v: T) => v },
    data: { validate: async () => null, extract: async <T>(v: T) => v },
    error: { is: async () => false, extract: async <T>(v: T) => v },
  };

  test('pass static method on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, method: 'QUERY' as const },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // exclude method from callApiFx signature
    expectAssignable<Parameters<typeof callApiFx>[0]>({ url });

    await allSettled(callApiFx, { scope, params: { url } });

    expect(fetchMock).toBeCalledWith(new Request(url, { method: 'QUERY' }));
  });

  test('pass reactive method on creation to request', async () => {
    const $method = createStore<HttpMethod>('GET');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials, method: $method },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // exclude method from callApiFx signature
    expectAssignable<Parameters<typeof callApiFx>[0]>({ url });

    // with original value
    await allSettled(callApiFx, { scope, params: { url } });
    expect(fetchMock).toBeCalledWith(new Request(url, { method: 'GET' }));

    // with new value
    await allSettled($method, { scope, params: 'POST' });
    await allSettled(callApiFx, { scope, params: { url } });
    expect(fetchMock).toBeCalledWith(new Request(url, { method: 'POST' }));
  });
});
