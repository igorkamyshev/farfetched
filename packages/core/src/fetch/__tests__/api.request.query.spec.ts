// TODO: jest-28
import 'whatwg-fetch';

import { allSettled, createStore, fork } from 'effector';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';
import { FetchApiRecord } from '../../misc/fetch_api';

describe('fetch/api.request.query', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const method = 'GET';
  const credentials = 'same-origin';

  // Does not matter
  const response = { extract: async <T>(v: T) => v };

  test('pass static query on call to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, url, method, credentials },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: { query: { foo: 'bar' } },
    });

    expect(fetchMock.mock.calls[0][0].url).toEqual(`${url}?foo=bar`);
  });

  test('pass static query on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        method,
        url,
        credentials,
        query: { test: 'yes' },
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: {} });

    expect(fetchMock.mock.calls[0][0].url).toEqual(`${url}?test=yes`);
  });

  test('pass reactive query on creation to request', async () => {
    const $query = createStore<FetchApiRecord>({ test: 'value' });

    const callApiFx = createApiRequest({
      request: { mapBody, method, url, credentials, query: $query },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock.mock.calls[0][0].url).toEqual(`${url}?test=value`);

    // with new value
    await allSettled($query, {
      scope,
      params: { other: 'new' },
    });
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock.mock.calls[1][0].url).toEqual(`${url}?other=new`);
  });

  test('merge sttaic and dynamic queries', async () => {
    const callApiFx = createApiRequest({
      request: {
        mapBody,
        url,
        method,
        credentials,
        query: { static: 'one', shared: 'static' },
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: {
        query: { dynamic: 'two', shared: 'dynamic' },
      },
    });

    expect(fetchMock.mock.calls[0][0].url).toEqual(
      `${url}?static=one&shared=static&shared=dynamic&dynamic=two`
    );
  });
});
