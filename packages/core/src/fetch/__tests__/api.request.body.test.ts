import { allSettled, createStore, fork } from 'effector';
import { expectAssignable } from 'tsd';

import { fetchCalledBodyText } from '../../test_utils/fetch_mock';
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
    prepare: { extract: async <T>(v: T) => v },
    data: { validate: async () => null, extract: async <T>(v: T) => v },
    error: { is: async () => false, extract: async <T>(v: T) => v },
  };

  describe.each(['GET' as const, 'HEAD' as const])(
    'disallow body for %p method',
    (method) => {
      test('static method and static body', async () => {
        // TODO: it should fail in TS
        const _failApiCallFx = createApiRequest({
          request: {
            mapBody,
            url,
            credentials,
            method,
            body: 'GET and HEAD must not have body',
          },
          response,
        });

        const _successApiCallFx = createApiRequest({
          request: {
            mapBody,
            url,
            credentials,
            method,
          },
          response,
        });
      });

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

        // TODO: it should fail in TS
        await allSettled(apiCallFx, {
          scope,
          params: {
            body: 'GET and HEAD must not have body',
          },
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

        // TODO: it should fail in TS
        await allSettled(apiCallFx, {
          scope,
          params: {
            body: 'GET and HEAD must not have body',
          },
        });

        await allSettled(apiCallFx, {
          scope,
          params: {},
        });
      });
    },
  );

  describe.each(['POST' as const, 'PUT' as const, 'PATCH' as const])(
    'disallow body for %p method',
    (method) => {
      test('static method and static body', async () => {
        const _apiCallFx = createApiRequest({
          request: {
            mapBody,
            url,
            credentials,
            method,
            body: 'It is ok',
          },
          response,
        });
      });

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
    },
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

    expect(await fetchCalledBodyText(fetchMock)).toBe('Call body');
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

    // exclude method from callApiFx signature
    expectAssignable<Parameters<typeof callApiFx>[0]>({});
    // @ts-expect-error
    expectAssignable<Parameters<typeof callApiFx>[0]>({ body: 'string' });

    await allSettled(callApiFx, { scope, params: {} });

    expect(await fetchCalledBodyText(fetchMock)).toBe('Static body');
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

    // exclude method from callApiFx signature
    expectAssignable<Parameters<typeof callApiFx>[0]>({});
    // @ts-expect-error
    expectAssignable<Parameters<typeof callApiFx>[0]>({ body: 'string' });

    await allSettled(callApiFx, { scope, params: {} });
    expect(await fetchCalledBodyText(fetchMock, 0)).toBe('First body');

    await allSettled($body, { scope, params: 'Second body' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(await fetchCalledBodyText(fetchMock, 1)).toBe('Second body');
  });
});
