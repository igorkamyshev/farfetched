import { createEffect } from 'effector';

import { fetchFx } from './fetch';

/**
 * Response with code is 4XX/5XX means that request failed
 */
class HttpError extends Error {
  constructor(public response: Response) {
    super(response.statusText);
  }
}

/**
 * Basic request effect around fetchFx, with some additional features:
 * + it throws error if response status is 4XX/5XX
 */
const requestFx = createEffect<Request, Response, TypeError | HttpError>({
  handler: async (request) => {
    const response = await fetchFx(request);

    if (isResponseFailed(response)) {
      throw new HttpError(response);
    }

    return response;
  },
  sid: 'r',
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
   *  application will receive TypeError from Fetch API on 3XX response
   */

  const isClientError = response.status > 399 && response.status < 500;
  const isServerError = response.status >= 500;

  return isClientError || isServerError;
}

export { HttpError, requestFx };
