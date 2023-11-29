import type { Event, EventCallable } from 'effector';

export type TriggerProtocol = {
  '@@trigger': () => {
    setup: EventCallable<void>;
    teardown: EventCallable<void>;
    fired: Event<unknown> | Event<void>;
  };
};
