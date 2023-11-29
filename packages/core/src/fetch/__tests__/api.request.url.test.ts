import { allSettled, createStore, fork, sample } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { configurationError } from '../../errors/create_error';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('fetch/api.request.url', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const method = 'GET';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('pass static url on call to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, method },
      response,
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, {
      scope,
      params: { url: 'https://api.salo.com' },
    });

    expect(fetchMock.mock.calls[0][0].url).toEqual('https://api.salo.com/');
  });

  test('pass static url on creation to request', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, url: 'https://api.salo.com', method },
      response,
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callApiFx, { scope, params: {} });

    expect(fetchMock.mock.calls[0][0].url).toEqual('https://api.salo.com/');
  });

  test('pass reactive url on creation to request', async () => {
    const $url = createStore('https://api.salo.com');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials, url: $url, method },
      response,
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('test'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    // with original value
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock.mock.calls[0][0].url).toEqual('https://api.salo.com/');

    // with new value
    await allSettled($url, { scope, params: 'https://new-api.salo.com' });
    await allSettled(callApiFx, { scope, params: {} });
    expect(fetchMock.mock.calls[1][0].url).toEqual('https://new-api.salo.com/');
  });

  test('throw configuration error if url is invalid', async () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, url: 'LOL KEK', method },
      response,
    });

    const $error = createStore<any>(null);

    sample({ clock: callApiFx.failData, target: $error });

    const scope = fork();

    await allSettled(callApiFx, { scope, params: {} });

    expect(scope.getState($error)).toEqual(
      configurationError({
        reason: 'Invalid URL',
        validationErrors: ['"LOL KEK" is not valid URL'],
      })
    );
  });
});
