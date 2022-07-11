import { allSettled, fork } from 'effector';

import {
  expectEffectDone,
  expectEffectFail,
  watchEffect,
} from '../../test_utils/watch_effect';
import { ApiError, createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.response.error', () => {
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

  test('return reponse as is if there is no error', async () => {
    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: noExtract },
        data: { extract: noExtract, validate: valid },
        error: { is: no, extract: noExtract },
      },
    });

    const effectWatcher = watchEffect(apiCallFx);

    const ORIGINAL_RESPONSE = new Response('ok');

    const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

    await allSettled(apiCallFx, {
      scope,
      params: {},
    });

    expectEffectDone(effectWatcher, ORIGINAL_RESPONSE);
  });

  test('return ApiError if there is error', async () => {
    const mockError = Symbol('mockError');

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: async () => 1 },
        data: { extract: noExtract, validate: valid },
        error: { is: yes, extract: async () => mockError },
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
      new ApiError(1, mockError, ORIGINAL_RESPONSE),
    );
  });
});
