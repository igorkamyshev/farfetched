import type { EventCallable, Event, Store } from 'effector';

import type { Mutex } from '../libs/lohyphen/mutex';

export type Barrier = {
  /**
   * Is Barrier active?
   */
  $active: Store<boolean>;
  /**
   * Event that triggers every time when Barrier is activated or active Barrier is touched
   */
  activated: Event<void>;
  /**
   * Event that triggers every time when Barrier is deactivated or inactive Barrier is touched
   */
  deactivated: Event<void>;
  /**
   * Event that triggers every time when all Barrier's performers are finished
   */
  performed: Event<void>;
  /**
   * Event that can be called to forcely deactivate Barrier
   */
  forceDeactivate: EventCallable<void>;
  /**
   * Semi-private properties, you have to avoid using them
   */
  __: {
    /**
     * Call this event every time when operation with applied Barrier tries to start
     */
    touch: EventCallable<void>;
    /**
     * Call this event every time when operation with applied Barrier fails
     */
    operationFailed: EventCallable<{ params: unknown; error: unknown }>;
    /**
     * Call this event every time when operation with applied Barrier succeeds
     */
    operationDone: EventCallable<{ params: unknown; result: unknown }>;
    /**
     * Barrier ia based on Mutex, this store provides direct access to it
     */
    $mutex: Store<Mutex | null>;
  };
};
