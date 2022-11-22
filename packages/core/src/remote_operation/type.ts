import { Effect, Event, EventPayload, Store } from 'effector';
import { ExecutionMeta } from '../misc/execution';

import { FetchingStatus } from '../status/type';

interface RemoteOperation<Params, Data, Error, Meta> {
  /**
   * Reactive current request status
   *
   * + `initial` — the data has never been fetched yet
   * + 'pending' — the data is being fetched right now
   * + 'done' — the data has been successfully fetched
   * + 'fail' — an error occurred while fetching data
   */
  $status: Store<FetchingStatus>;
  /** Is fetching in progress right now? */
  $pending: Store<boolean>;
  /** Is fetching failed? */
  $failed: Store<boolean>;
  /** Is fetching succeeded? */
  $succeeded: Store<boolean>;
  /**
   * Is operation enabled?
   *
   * + false — any `start` call will be ignored, event done.skip will be fired immediately
   * + true — query will be executed after any `start` call
   */
  $enabled: Store<boolean>;
  /** Event to trigger query */
  start: Event<Params>;
  /** Set of events that represent end of query */
  finished: {
    /** Query was successfully ended, data will be passed as a payload */
    success: Event<{ params: Params; data: Data; meta: ExecutionMeta }>;
    /** Query was failed, error will be passed as a payload */
    failure: Event<{ params: Params; error: Error; meta: ExecutionMeta }>;
    /** Query execution was skipped due to `enabled` field in config */
    skip: Event<{ params: Params; meta: ExecutionMeta }>;
    /** Query was ended, it merges `success`, `error` and `skip` */
    finally: Event<{ params: Params; meta: ExecutionMeta }>;
  };
  /**
   * DO NOT USE THIS FIELD IN PRODUCTION
   *
   * It is internal operator details which is useful for testing.
   */
  __: {
    /**
     * Internal effect, which executes to retrieve data.
     *
     * It must not be used in production. Please use it only for test purposes.
     *
     * @example
     *
     * import { locationQuery } from './location';
     *
     * test('some test', async () => {
     *   const scope = fork({
     *     handlers: [[locationQuery.__.executeFx, vi.fn()]]
     *   });
     *
     *   //...test code
     * })
     */
    executeFx: Effect<any, any, any>;
    /**
     * Meta information about operation and its configuration.
     */
    meta: Meta;
    /**
     * Distinguish different kinds of operations
     */
    kind: unknown;
    /**
     * Low-level API, it can be changed anytime without any notice!
     */
    lowLevelAPI: {
      sources: Array<Store<unknown>>;
      registerInterruption: () => void;
      validatedSuccessfully: Event<{ params: Params; result: unknown }>;
      fillData: Event<{
        params: Params;
        result: unknown;
        meta: ExecutionMeta;
      }>;
      resumeExecution: Event<{ params: Params }>;
    };
  };
}

type RemoteOperationData<Q extends RemoteOperation<any, any, any, any>> =
  EventPayload<Q['finished']['success']>['data'];
type RemoteOperationError<Q extends RemoteOperation<any, any, any, any>> =
  EventPayload<Q['finished']['failure']>['error'];
type RemoteOperationParams<Q extends RemoteOperation<any, any, any, any>> =
  EventPayload<Q['start']>;

export {
  type RemoteOperation,
  type RemoteOperationData,
  type RemoteOperationError,
  type RemoteOperationParams,
};
