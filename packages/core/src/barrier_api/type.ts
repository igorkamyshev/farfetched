import { type Event, type Store } from 'effector';

import { Mutex } from '../libs/lohyphen/mutex';

export type Barrier = {
  $active: Store<boolean>;
  activated: Event<void>;
  deactivated: Event<void>;
  __: {
    touch: Event<void>;
    operationFailed: Event<{ params: unknown; error: unknown }>;
    operationDone: Event<{ params: unknown; result: unknown }>;
    $mutex: Store<Mutex | null>;
  };
};
