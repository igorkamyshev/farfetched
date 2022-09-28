import { createEffect } from 'effector';
import { HttpError, NetworkError } from '../errors/type';
import { httpError, networkError } from '../errors/create_error';

import { fetchFx } from './fetch';

/**
 * Basic request effect around fetchFx, with some additional features:
 * + it throws error if response status is 4XX/5XX
 * + it throws serializable NetworkError instead of TypeError
 */
const requestFx = createEffect<Request, Response, NetworkError | HttpError>({
  handler: async (request) => {
    const response = await fetchFx(request).catch((cause) => {
      throw networkError({ reason: cause?.message ?? null });
    });

    if (!response.ok) {
      throw httpError({
        status: response.status,
        statusText: response.statusText,
        response: (await response.text().catch(() => null)) ?? null,
      });
    }

    return response;
  },
  sid: 'ff.requestFx',
});

export { requestFx };
