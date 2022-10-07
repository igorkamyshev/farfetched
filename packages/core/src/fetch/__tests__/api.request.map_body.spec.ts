import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createApiRequest, RequestBody } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.map_body', () => {
  // Does not matter
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('call mapBody on dynamic body', async () => {
    const mapBody = vi.fn().mockImplementation((v) => v + v);

    const callApiFx = createApiRequest({
      request: { url, method: 'POST' as const, credentials, mapBody },
      response,
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: { body: 'двараза' } });

    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('двараза');
    expect(await fetchMock.mock.calls[0][0].text()).toBe('дваразадвараза');
  });

  test('call mapBody on static body', async () => {
    const mapBody = vi.fn().mockImplementation((v) => v + v);

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

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });

    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('двараза');
    expect(await fetchMock.mock.calls[0][0].text()).toBe('дваразадвараза');
  });

  test('call mapBody on reactive body', async () => {
    const mapBody = vi.fn().mockImplementation((v) => v + v);

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

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });
    expect(mapBody).toBeCalledTimes(1);
    expect(mapBody).toBeCalledWith('раз');
    expect(await await fetchMock.mock.calls[0][0].text()).toBe('разраз');

    await allSettled($body, { scope, params: 'два' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(mapBody).toBeCalledTimes(2);
    expect(mapBody).toBeCalledWith('два');
    expect(await await fetchMock.mock.calls[1][0].text()).toBe('двадва');
  });
});
