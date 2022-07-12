// TODO: jest-28
import 'whatwg-fetch';

import { watchEffect } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';

import { createApiRequest, PreparationError } from '../api';
import { fetchFx } from '../fetch';

describe('fetch/api.response.all_in_one', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  const callJsonApiFx = createApiRequest({
    request,
    response: {
      extract: (response) => response.json(),
    },
  });

  test('success data', async () => {
    const scope = fork({
      handlers: [
        [
          fetchFx,
          // Success
          () => new Response(JSON.stringify({ data: [1, 2], errors: null })),
        ],
      ],
    });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(watcher.listeners.onDoneData).toHaveBeenCalledWith({
      data: [1, 2],
      errors: null,
    });
  });

  test('failed preparation', async () => {
    const scope = fork({
      handlers: [[fetchFx, () => new Response('This is not JSON')]],
    });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(watcher.listeners.onFailData).toBeCalledWith(
      new PreparationError(new Response('This is not JSON'), new Error())
    );
  });
});
