import { Effect, Event, EventPayload, Store } from 'effector';
import { Serialize } from '../serialization/type';

import { FetchingStatus } from '../status/type';

const QuerySymbol = Symbol('Query');

interface Query<Params, Data, Error> {
  /**
   * The reactive value of the latest received data.
   *
   * If there was an error during fetching or there has not been a request yet, the store will be `null`.
   */
  $data: Store<Data | null>;
  /**
   * The reactive value of the data retrieval error.
   *
   * If the data was successfully fetched or there is no request yet, the store will be `null`.
   */
  $error: Store<Error | null>;
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
   * Is query enabled?
   *
   * + false — any `start` call will be ignored, event done.skip will be fired immediately
   * + true — query will be executed after any `start` call
   */
  $enabled: Store<boolean>;
  /**
   * Is data stale?
   */
  $stale: Store<boolean>;
  /** Event to trigger query */
  start: Event<Params>;
  /** Event to reset the whole state of the query */
  reset: Event<void>;
  /** Set of events that represent end of query */
  finished: {
    /** Query was successfully ended, data will be passed as a payload */
    success: Event<{ params: Params; data: Data }>;
    /** Query was failed, error will be passed as a payload */
    failure: Event<{ params: Params; error: Error }>;
    /** Query execution was skipped due to `enabled` field in config */
    skip: Event<{ params: Params }>;
    /** Query was ended, it merges `success`, `error` and `skip` */
    finally: Event<{ params: Params }>;
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
     *     handlers: [[locationQuery.__.executeFx, jest.fn()]]
     *   });
     *
     *   //...test code
     * })
     */
    executeFx: Effect<any, any, any>;
    /**
     * Meta information about Query and its configuration.
     */
    meta: {
      /**
       * This field is used to determine how to serialize data in various cases:
       * - transfer state from server to client during SSR
       * - save state to persistent storage during caching
       */
      serialize: Serialize<Data>;
    };
    query: typeof QuerySymbol;
  };
}

type QueryData<Q extends Query<any, any, any>> = EventPayload<
  Q['finished']['success']
>['data'];
type QueryError<Q extends Query<any, any, any>> = EventPayload<
  Q['finished']['failure']
>['error'];
type QueryParams<Q extends Query<any, any, any>> = EventPayload<Q['start']>;

function isQuery(value: any): value is Query<any, any, any> {
  return value?.__?.query === QuerySymbol;
}

export {
  type Query,
  QuerySymbol,
  isQuery,
  type QueryData,
  type QueryError,
  type QueryParams,
};
