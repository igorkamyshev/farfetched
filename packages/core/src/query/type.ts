import { Effect, Event, Store } from 'effector';

import { FetchingStatus } from '../status/type';

interface Query<Params, TransformedData, Error> {
  /**
   * The reactive value of the received data.
   *
   * If there was an error during fetching or there has not been a request yet, the store will be `null`.
   */
  $data: Store<TransformedData | null>;
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
  /** Event to trigger query manual */
  start: Event<Params>;
  /** Set of events that represent end of query */
  done: {
    /** Query was successfully ended, data will be passed as a payload */
    success: Event<TransformedData>;
    /** Query was failed, error will be passed as a payload */
    error: Event<Error>;
    /** Query execution was skipped due to `disable` field in config */
    skip: Event<void>;
    /** Query was ended, it merges `success`, `error` and `skip` */
    finally: Event<void>;
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
    // any can be used here, because it is internal field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFx: Effect<any, any, any>;
  };
}

export { type Query };
