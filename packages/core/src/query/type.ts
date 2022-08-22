import { Effect, Event, Store } from 'effector';

import { FetchingStatus } from '../status/type';

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
  /** Set of events that represent end of query */
  done: {
    /** Query was successfully ended, data will be passed as a payload */
    success: Event<{ data: Data }>;
    /** Query was failed, error will be passed as a payload */
    error: Event<{ error: Error }>;
    /** Query execution was skipped due to `enabled` field in config */
    skip: Event<{}>;
    /** Query was ended, it merges `success`, `error` and `skip` */
    finally: Event<{}>;
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
  };
}

export { type Query };
