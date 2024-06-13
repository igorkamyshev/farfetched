import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchEffect } from '../../test_utils/watch_effect';
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

    expect(watcher.listeners.onDoneData).toBeCalledWith({
      data: { test: 'value' },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
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
    expect(watcher.listeners.onDoneData).toBeCalledWith({
      data: null,
      headers: {
        'content-length': '0',
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
  });

  test('empty body without header as null', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = vi.fn().mockResolvedValue(new Response(''));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(watcher.listeners.onFailData).not.toBeCalled();
    expect(watcher.listeners.onDoneData).toBeCalledWith({
      data: null,
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
  });
});
