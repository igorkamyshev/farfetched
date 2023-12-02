import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchEffect } from '../../test_utils/watch_effect';
import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';
import { preparationError } from '../../errors/create_error';

describe('fetch/api.response.prepare', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  test('pass oriiginal response to preparation', async () => {
    const extractMock = vi.fn().mockImplementation((t) => t);

    const apiCallFx = createApiRequest({
      request,
      response: {
        extract: extractMock,
      },
    });

    const ORIGINAL_RESPONSE = new Response('ok');

    const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

    await allSettled(apiCallFx, {
      scope,
      params: {},
    });

    expect(extractMock).toHaveBeenCalledWith(ORIGINAL_RESPONSE);
  });
});

describe('fetch/api.response.exceptions', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  test.each([
    {
      type: 'sync',
      fn: (): any => {
        throw new Error('oops');
      },
    },
    {
      type: 'async',
      fn: async (): Promise<any> => {
        throw new Error('oops');
      },
    },
  ])(
    'return PreparationError if reponse.extract throw $type error in callback',
    async ({ fn }) => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          extract: fn,
        },
      });

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      const effectWatcher = watchEffect(apiCallFx, scope);

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expect(effectWatcher.listeners.onFailData).toHaveBeenCalledWith(
        preparationError({ response: 'ok', reason: 'oops' })
      );
    }
  );
});
