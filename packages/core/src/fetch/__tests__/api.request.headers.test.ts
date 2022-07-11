import { allSettled, createStore, fork } from 'effector';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.headers', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const method = 'GET';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    prepare: { extract: async <T>(v: T) => v },
    data: { validate: async () => null, extract: async <T>(v: T) => v },
    error: { is: async () => false, extract: async <T>(v: T) => v },
  };

  test('pass static headers on call to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, url, method, credentials },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: { headers: { foo: 'bar' } },
    });

    expect(fetchMock).toBeCalledWith(
      new Request(url, { headers: { foo: 'bar' } }),
    );
  });

  test('pass static headers on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        method,
        url,
        credentials,
        headers: { test: 'yes' },
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: {} });

    expect(fetchMock).toBeCalledWith(
      new Request(url, { headers: { test: 'yes' } }),
    );
  });

  test('pass reactive headers on creation to request', async () => {
    const $headers = createStore<HeadersInit>({ test: 'value' });

    const callApiFx = createApiRequest({
      request: { mapBody, method, url, credentials, headers: $headers },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(
      new Request(url, { headers: { test: 'value' } }),
    );

    // with new value
    await allSettled($headers, {
      scope,
      params: { other: 'new' },
    });
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(
      new Request(url, { headers: { other: 'new' } }),
    );
  });

  test('merge staic and dynamic headers lists', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        url,
        method,
        credentials,
        headers: { static: 'one', shared: 'static' },
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: {
        headers: { dynamic: 'two', shared: 'dynamic' },
      },
    });

    expect(fetchMock).toBeCalledWith(
      new Request(url, {
        headers: {
          static: 'one',
          shared: 'static, dynamic',
          dynamic: 'two',
        },
      }),
    );
  });
});
