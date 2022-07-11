import { allSettled, createStore, fork } from 'effector';

import { fetchCalledBodyText } from '../../test_utils/fetch_mock';
import { createApiRequest, RequestBody } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.map_body', () => {
  // Does not matter
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    prepare: { extract: async <T>(v: T) => v },
    data: { validate: async () => null, extract: async <T>(v: T) => v },
    error: { is: async () => false, extract: async <T>(v: T) => v },
  };

  test('call mapBody on dynamic body', async () => {
    const mapBody = jest.fn().mockImplementation((v) => v + v);

    const callApiFx = createApiRequest({
      request: { url, method: 'POST' as const, credentials, mapBody },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: { body: 'двараза' } });

    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('двараза');
    expect(await fetchCalledBodyText(fetchMock)).toBe('дваразадвараза');
  });

  test('call mapBody on static body', async () => {
    const mapBody = jest.fn().mockImplementation((v) => v + v);

    const callApiFx = createApiRequest({
      request: {
        url,
        method: 'POST' as const,
        credentials,
        mapBody,
        body: 'двараза',
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });

    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('двараза');
    expect(await fetchCalledBodyText(fetchMock)).toBe('дваразадвараза');
  });

  test('call mapBody on reactive body', async () => {
    const mapBody = jest.fn().mockImplementation((v) => v + v);

    const $body = createStore<RequestBody>('раз');

    const callApiFx = createApiRequest({
      request: {
        url,
        method: 'POST' as const,
        credentials,
        mapBody,
        body: $body,
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });
    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('раз');
    expect(await fetchCalledBodyText(fetchMock, 0)).toBe('разраз');

    await allSettled($body, { scope, params: 'два' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(mapBody).toBeCalledTimes(2);
    expect(mapBody).toBeCalledWith('два');
    expect(await fetchCalledBodyText(fetchMock, 1)).toBe('двадва');
  });
});
