import { allSettled, fork } from 'effector';
import { Array, Null, Number, Record, Runtype, String } from 'runtypes';
import { expectType } from 'tsd';

import {
  expectEffectDone,
  expectEffectFail,
  watchEffect,
} from '../../test_utils/watch_effect';
import { ApiError, createApiRequest, PreparationError } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.response.all_in_one', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  const SuccessResponse = Record({ data: Array(Number), errors: Null });
  const ErrorResponse = Record({ data: Null, errors: Array(String) });

  const callJsonApiFx = createApiRequest({
    request,
    response: {
      prepare: { extract: (response) => response.json() },
      data: {
        extract: async (response) => SuccessResponse.check(response).data,
        validate: async (response) =>
          validateByRuntype(SuccessResponse, response),
      },
      error: {
        extract: async (response) => ErrorResponse.check(response).errors,
        is: async (response) => ErrorResponse.guard(response),
      },
    },
  });

  test('success data', async () => {
    // Result should conform data.extract type
    callJsonApiFx.doneData.watch((data) => {
      expectType<number[]>(data);
    });

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

    expectEffectDone(watcher, [1, 2]);
  });

  test('api error', async () => {
    // ApiError should conform error.extract type
    callJsonApiFx.failData.watch((error) => {
      if (error instanceof ApiError) {
        expectType<ApiError<string[], any>>(error);
      }
    });

    const scope = fork({
      handlers: [
        [
          fetchFx,
          // ApiError
          () =>
            new Response(
              JSON.stringify({ data: null, errors: ['lol', 'kek'] }),
            ),
        ],
      ],
    });

    const watcher = watchEffect(callJsonApiFx, scope);

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expectEffectFail(
      watcher,
      new ApiError(
        { data: null, errors: ['lol', 'kek'] },
        ['lol', 'kek'],
        new Response(JSON.stringify({ data: null, errors: ['lol', 'kek'] })),
      ),
    );
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

    expectEffectFail(
      watcher,
      new PreparationError(new Response('This is not JSON'), new Error()),
    );
  });
});

function validateByRuntype<T>(
  contract: Runtype<T>,
  data: any,
): null | string[] {
  const validation = contract.validate(data);
  if (validation.success) {
    return null;
  }

  return [validation.message];
}
