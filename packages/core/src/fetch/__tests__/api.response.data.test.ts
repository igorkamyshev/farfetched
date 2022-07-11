import { allSettled, Effect, fork } from 'effector';
import { expectAssignable } from 'tsd';

import {
  expectEffectDone,
  expectEffectFail,
  watchEffect,
} from '../../test_utils/watch_effect';
import { createApiRequest, InvalidDataError } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.response.data', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  const noExtract = async <T>(v: T) => v;
  const no = async () => false;
  const valid = async () => null;

  test('return InvalidDataError if data is not valid', async () => {
    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: noExtract },
        data: { extract: noExtract, validate: async () => ['Nope'] },
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

    expectEffectFail(
      effectWatcher,
      new InvalidDataError(ORIGINAL_RESPONSE, ['Nope']),
    );
  });

  test('return transformeddata if there no errors (return null)', async () => {
    const mockData = Symbol('mockData');

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: noExtract },
        data: { extract: async () => mockData, validate: valid },
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

    expectAssignable<Effect<any, symbol, any>>(apiCallFx);
    expectEffectDone(effectWatcher, mockData);
  });

  test('return transformeddata if there no errors (return empty array)', async () => {
    const mockData = Symbol('mockData');

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: noExtract },
        data: { extract: async () => mockData, validate: async () => [] },
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

    expectAssignable<Effect<any, symbol, any>>(apiCallFx);
    expectEffectDone(effectWatcher, mockData);
  });
});
