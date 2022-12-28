import { watchEffect } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../fetch';
import { createJsonApiRequest } from '../json';
import { preparationError } from '../../errors/create_error';

describe('fetch/json.response.data', () => {
  // Does not matter
  const request = {
    method: 'POST' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
  };

  test('throw error on non-json body', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = vi.fn().mockResolvedValue(new Response('It is not JSON'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: { body: { some: 'test' } },
    });

    expect(watcher.listeners.onFailData).toBeCalledWith(
      preparationError({
        response: 'It is not JSON',
        reason: 'Unexpected token I in JSON at position 0',
      })
    );
  });

  test('return parsed json body', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ test: 'value' })));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: { body: {} },
    });

    expect(watcher.listeners.onDoneData).toBeCalledWith({ test: 'value' });
  });

  test('empty body as null', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response('', { headers: { 'Content-Length': '0' } })
      );

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(watcher.listeners.onFailData).not.toBeCalled();
    expect(watcher.listeners.onDoneData).toBeCalledWith(null);
  });
});
