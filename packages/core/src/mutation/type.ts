import { Effect, Event, EventPayload, Store } from 'effector';

import { FetchingStatus } from '../status/type';

const MutationSymbol = Symbol('Mutation');

// TODO: extract shared parts with Query to separate RemoteOperation type
interface Mutation<Params, Data, Error> {
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
   * Is mutation enabled?
   *
   * + false — any `start` call will be ignored, event finished.skip will be fired immediately
   * + true — query will be executed after any `start` call
   */
  $enabled: Store<boolean>;
  /** Event to start mutation */
  start: Event<Params>;
  /** Set of events that represent end of mutation */
  finished: {
    /** Mutation was successfully ended, data will be passed as a payload */
    success: Event<{ params: Params; data: Data }>;
    /** Mutation was failed, error will be passed as a payload */
    failure: Event<{ params: Params; error: Error }>;
    /** Mutation execution was skipped due to `enabled` field in config */
    skip: Event<{ params: Params }>;
    /** Mutation was ended, it merges `success`, `error` and `skip` */
    finally: Event<{ params: Params }>;
  };
  /**
   * DO NOT USE THIS FIELD IN PRODUCTION
   *
   * It is internal operator details which is useful for testing.
   */
  __: {
    /**
     * Internal effect, which executes to performt mutation.
     *
     * It must not be used in production. Please use it only for test purposes.
     *
     * @example
     *
     * import { loginMutation } from './location';
     *
     * test('some test', async () => {
     *   const scope = fork({
     *     handlers: [[loginMutation.__.executeFx, jest.fn()]]
     *   });
     *
     *   //...test code
     * })
     */
    executeFx: Effect<any, any, any>;
    /**
     * Meta information about Mutation and its configuration.
     */
    meta: never;
    kind: typeof MutationSymbol;
  };
}

type MutationData<Q extends Mutation<any, any, any>> = EventPayload<
  Q['finished']['success']
>['data'];
type MutationError<Q extends Mutation<any, any, any>> = EventPayload<
  Q['finished']['failure']
>['error'];
type MutationParams<Q extends Mutation<any, any, any>> = EventPayload<
  Q['start']
>;

function isMutation(value: any): value is Mutation<any, any, any> {
  return value?.__?.kind === MutationSymbol;
}

export {
  type Mutation,
  type MutationData,
  type MutationParams,
  type MutationError,
  isMutation,
};
