import { type Event, type Store } from 'effector';

export type Barrier = {
  $active: Store<boolean>;
  activated: Event<void>;
  deactivated: Event<void>;
  __: {
    touch: Event<void>;
    operationFailed: Event<{ params: unknown; error: unknown }>;
    operationDone: Event<{ params: unknown; result: unknown }>;
  };
};
