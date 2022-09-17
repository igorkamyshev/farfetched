import { allSettled, createStore, fork } from 'effector';

import { createApiRequest, RequestBody } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.request.body', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const noMap = <V>(v: V) => v;
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  describe.each(['GET' as const, 'HEAD' as const])(
    'disallow body for %p method',
    (method) => {
      test('static method and dynamic body', async () => {
        const apiCallFx = createApiRequest({
          request: {
            mapBody,
            url,
            credentials,
            method,
          },
          response,
        });

        const scope = fork({
          handlers: [[fetchFx, () => new Response('Ok')]],
        });

        await allSettled(apiCallFx, {
          scope,
          params: {},
        });
      });

      test('static method and dynamic body', async () => {
        const apiCallFx = createApiRequest({
          request: {
            mapBody,
            method,
            url,
            credentials,
          },
          response,
        });

        const scope = fork({
          handlers: [[fetchFx, () => new Response('Ok')]],
        });

        await allSettled(apiCallFx, {
          scope,
          params: {},
        });
      });
    }
  );

  describe.each(['POST' as const, 'PUT' as const, 'PATCH' as const])(
    'disallow body for %p method',
    (method) => {
      test('static method and dynamic body', async () => {
        const apiCallFx = createApiRequest({
          request: {
            mapBody,
            url,
            credentials,
            method,
          },
          response,
        });

        const scope = fork({
          handlers: [[fetchFx, () => new Response('Ok')]],
        });

        await allSettled(apiCallFx, {
          scope,
          params: {
            body: 'It is ok',
          },
        });
      });

      test('dynamic method and dynamic body', async () => {
        const apiCallFx = createApiRequest({
          request: {
            method,
            mapBody,
            url,
            credentials,
          },
          response,
        });

        const scope = fork({
          handlers: [[fetchFx, () => new Response('Ok')]],
        });

        await allSettled(apiCallFx, {
          scope,
          params: {
            body: 'It is ok',
          },
        });
      });
    }
  );

  test('pass dynamic body to request', async () => {
    const callApiFx = createApiRequest({
      request: { url, method: 'POST' as const, credentials, mapBody: noMap },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: { body: 'Call body' } });

    expect(await fetchMock.mock.calls[0][0].text()).toBe('Call body');
  });

  test('pass static body to request', async () => {
    const callApiFx = createApiRequest({
      request: {
        url,
        method: 'POST' as const,
        credentials,
        mapBody: noMap,
        body: 'Static body',
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });

    expect(await fetchMock.mock.calls[0][0].text()).toBe('Static body');
  });

  test('pass reactive body to request', async () => {
    const $body = createStore<RequestBody>('First body');

    const callApiFx = createApiRequest({
      request: {
        url,
        method: 'POST' as const,
        credentials,
        mapBody: noMap,
        body: $body,
      },
      response,
    });

    const fetchMock = jest.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(callApiFx, { scope, params: {} });
    expect(await fetchMock.mock.calls[0][0].text()).toBe('First body');

    await allSettled($body, { scope, params: 'Second body' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(await fetchMock.mock.calls[1][0].text()).toBe('Second body');
  });
});
