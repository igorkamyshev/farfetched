import { allSettled, fork } from 'effector';

import {
  expectEffectDone,
  expectEffectFail,
  watchEffect,
} from '../../test_utils/watch_effect';
import { fetchFx } from '../fetch';
import { HttpError, requestFx } from '../request';

describe('remote_data/transport/request', () => {
  describe('status codes', () => {
    test.each([200, 201, 202, 203, 204, 205, 206, 207, 208, 226])(
      'pass response with successful code %p as is',
      async (code) => {
        const effectWatcher = watchEffect(requestFx);

        const SUCCESSFUL_RESPONSE = new Response(null, {
          status: code,
        });

        const scope = fork({
          handlers: [[fetchFx, () => SUCCESSFUL_RESPONSE]],
        });

        await allSettled(requestFx, {
          scope,
          params: new Request('https://api.salo.com'),
        });

        expectEffectDone(effectWatcher, SUCCESSFUL_RESPONSE);
      },
    );

    test.each([
      400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
      415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500,
      501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
    ])('transforms response with error code %p to error', async (code) => {
      const effectWatcher = watchEffect(requestFx);

      const FAILED_RESPONSE = new Response(null, {
        status: code,
        statusText: 'Request cannot',
      });

      const scope = fork({
        handlers: [[fetchFx, () => FAILED_RESPONSE]],
      });

      await allSettled(requestFx, {
        scope,
        params: new Request('https://api.salo.com'),
      });

      expectEffectFail(effectWatcher, new HttpError(FAILED_RESPONSE));
    });
  });
});
