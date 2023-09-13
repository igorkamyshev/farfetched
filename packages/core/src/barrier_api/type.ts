import { type Event, type Store } from 'effector';

export type Barrier = {
  $active: Store<boolean>;
  activated: Event<void>;
  deactivated: Event<void>;
};
