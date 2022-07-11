import { allSettled, createStore, fork } from 'effector';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.query', () => {
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

  test('pass static query on call to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, url, method, credentials },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: { query: new URLSearchParams({ foo: 'bar' }) },
    });

    expect(fetchMock).toBeCalledWith(new Request(`${url}?foo=bar`));
  });

  test('pass static query on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        method,
        url,
        credentials,
        query: new URLSearchParams({ test: 'yes' }),
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: {} });

    expect(fetchMock).toBeCalledWith(new Request(`${url}?test=yes`));
  });

  test('pass reactive query on creation to request', async () => {
    const $query = createStore(new URLSearchParams({ test: 'value' }));

    const callApiFx = createApiRequest({
      request: { mapBody, method, url, credentials, query: $query },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(new Request(`${url}?test=value`));

    // with new value
    await allSettled($query, {
      scope,
      params: new URLSearchParams({ other: 'new' }),
    });
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock).toBeCalledWith(new Request(`${url}?other=new`));
  });

  test('merge sttaic and dynamic queries', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        url,
        method,
        credentials,
        query: new URLSearchParams({ static: 'one', shared: 'static' }),
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: {
        query: new URLSearchParams({ dynamic: 'two', shared: 'dynamic' }),
      },
    });

    expect(fetchMock).toBeCalledWith(
      new Request(`${url}?static=one&shared=static&dynamic=two&shared=dynamic`),
    );
  });
});
