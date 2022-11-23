import { createEffect } from 'effector';

/**
 * Effect wrapper for Fetch API
 *
 * It's used to declare static type of Error and mock requests in tests
 */
export const fetchFx = createEffect<Request, Response, TypeError>({
  sid: 'ff.fetchFx',
  handler: globalThis.fetch,
});
