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

    if (isResponseFailed(response)) {
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

function isResponseFailed(response: Response) {
  /*
   * information codes 1xx does not supported by fetch,
   * so we do not have to not handle them
   */

  /*
   * redirection codex 3xx will be transparent for application:
   *
   * + if request has `redirect: follow` (default behavior),
   *  application will receive response from the of redirection chain
   *
   * + if request has `redirect: error` or `redirect: manual`,
   *  application will receive NetworkError based on TypeError from Fetch API on 3XX response
   */

  const isClientError = response.status > 399 && response.status < 500;
  const isServerError = response.status >= 500;

  return isClientError || isServerError;
}

export { requestFx };
