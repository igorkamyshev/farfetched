import { allSettled, fork } from 'effector';

import { expectEffectFail, watchEffect } from '../../test_utils/watch_effect';
import {
  createApiRequest,
  ExtractionError,
  PreparationError,
  ValidationFailedError,
} from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.response.exceptions', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  const noExtract = async <T>(v: T) => v;
  const no = async () => false;
  const yes = async () => true;
  const valid = async () => null;

  describe.each([
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
  ])('throw $type error in callback', ({ fn }) => {
    test('return ExtractionError if error.extract throws error', async () => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          prepare: { extract: async () => 1 },
          data: { extract: noExtract, validate: valid },
          error: {
            is: yes,
            extract: fn,
          },
        },
      });

      const effectWatcher = watchEffect(apiCallFx);

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expectEffectFail(
        effectWatcher,
        new ExtractionError(1, 'error', new Error('Oooops')),
      );
    });

    test('return ExtractionError if error.is throws $name error', async () => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          prepare: { extract: async () => 1 },
          data: { extract: noExtract, validate: valid },
          error: {
            is: fn,
            extract: noExtract,
          },
        },
      });

      const effectWatcher = watchEffect(apiCallFx);

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expectEffectFail(
        effectWatcher,
        new ExtractionError(1, 'error', new Error('Oooops')),
      );
    });

    test('return ExtractionError if error.extract throw error', async () => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          prepare: { extract: async () => 1 },
          data: {
            extract: fn,
            validate: valid,
          },
          error: {
            is: no,
            extract: noExtract,
          },
        },
      });

      const effectWatcher = watchEffect(apiCallFx);

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expectEffectFail(
        effectWatcher,
        new ExtractionError(1, 'data', new Error('Oooops')),
      );
    });

    test('return ExatractionError if prepare.exatrct throw error', async () => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          prepare: { extract: fn },
          data: {
            extract: noExtract,
            validate: valid,
          },
          error: {
            is: no,
            extract: noExtract,
          },
        },
      });

      const effectWatcher = watchEffect(apiCallFx);

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expectEffectFail(
        effectWatcher,
        new PreparationError(ORIGINAL_RESPONSE, new Error('Oooops')),
      );
    });

    test('return ValidationError if data.validate throw error', async () => {
      const apiCallFx = createApiRequest({
        request,
        response: {
          prepare: { extract: async () => 1 },
          data: {
            extract: noExtract,
            validate: fn,
          },
          error: {
            is: no,
            extract: noExtract,
          },
        },
      });

      const effectWatcher = watchEffect(apiCallFx);

      const ORIGINAL_RESPONSE = new Response('ok');

      const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

      await allSettled(apiCallFx, {
        scope,
        params: {},
      });

      expectEffectFail(
        effectWatcher,
        new ValidationFailedError(1, new Error('Oooops')),
      );
    });
  });
});
