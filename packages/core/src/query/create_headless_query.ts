import { createEffect, createEvent, createStore, sample } from 'effector';

import { mergeOptionalConfig, OptionalConfig } from '../misc/sid';
import { FetchingStatus } from '../status/type';
import { Query } from './type';

/**
 * Creates Query without any executor, it cannot be used as-is.
 *
 * @example
 * const headlessQuery = createHeadlessQuery()
 * headlessQuery.__.executeFx.use(someHandler)
 */
function createHeadlessQuery<Params, Response, Error>(
  config?: OptionalConfig
): Query<Params, Response, Error> {
  // Dummy effect, it will be replaced with real in head-full query creator
  const executeFx = createEffect<Params, Response, Error>({
    handler: () => {
      throw new Error('Not implemented');
    },
    ...mergeOptionalConfig({ sid: 'e', name: 'executeFx' }, config),
  });

  /*
   * Start event, it's used as it or to pipe it in head-full query creator
   *
   * sample({
   *  clock: externalStart,
   *  target: headlessQuery.start,
   *  greedy: true
   * })
   */
  const start = createEvent<Params>();

  // Signal-events
  const done = {
    success: createEvent<Response>(),
    error: createEvent<Error>(),
    skip: createEvent(),
    finally: createEvent(),
  };

  // Main stores
  const $data = createStore<Response | null>(
    null,
    mergeOptionalConfig({ sid: 'd', name: '$data' }, config)
  );
  const $error = createStore<Error | null>( 
    null,
    mergeOptionalConfig({ sid: 'e', name: '$error' }, config)
  );
  const $status = createStore<FetchingStatus>(
    'initial',
    mergeOptionalConfig({ sid: 's', name: '$status' }, config)
  );

  // Execution handling
  sample({ clock: start, target: executeFx });
  sample({ clock: executeFx.doneData, target: [$data, done.success] });
  sample({ clock: executeFx.failData, target: [$error, done.error] });

  sample({ clock: done.success, fn: () => null, target: $error });
  sample({ clock: done.error, fn: () => null, target: $data });

  sample({
    clock: [done.success, done.error, done.skip],
    fn() {
      // do not pass any payload to done.finally
    },
    target: done.finally,
  });

  // Execution status
  sample({
    clock: [
      start.map(() => 'pending' as const),
      done.success.map(() => 'done' as const),
      done.error.map(() => 'fail' as const),
    ],
    target: $status,
  });

  // Derived stores
  const $pending = $status.map((status) => status === 'pending');

  return {
    start,
    $data,
    $error,
    done,
    $status,
    $pending,
    __: { executeFx },
  };
}

export { createHeadlessQuery };
