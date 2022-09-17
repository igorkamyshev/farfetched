import { allSettled, createStore, fork } from 'effector';

import { createApiRequest, HttpMethod } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.method', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('pass static method on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, method: 'QUERY' as const },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: { url } });

    expect(fetchMock.mock.calls[0][0].method).toEqual('QUERY');
  });

  test('pass reactive method on creation to request', async () => {
    const $method = createStore<HttpMethod>('GET');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials, method: $method },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: { url } });
    expect(fetchMock.mock.calls[0][0].method).toEqual('GET');

    // with new value
    await allSettled($method, { scope, params: 'POST' });
    await allSettled(callApiFx, { scope, params: { url } });
    expect(fetchMock.mock.calls[1][0].method).toEqual('POST');
  });
});
