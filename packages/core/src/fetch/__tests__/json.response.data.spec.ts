// TODO: jest-28
import 'whatwg-fetch';

import { watchEffect } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';

import { PreparationError } from '../api';
import { fetchFx } from '../fetch';
import { createJsonApiRequest } from '../json';

describe('fetch/json.response.data', () => {
  // Does not matter
  const request = {
    method: 'POST' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
  };

  test('throw error on non-json body', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('It is not JSON'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: { body: { some: 'test' } },
    });

    expect(watcher.listeners.onFailData).toBeCalledWith(
      new PreparationError(new Response('It is not JSON'), new Error())
    );
  });

  test('return parsed json body', async () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    const fetchMock = jest
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
});
