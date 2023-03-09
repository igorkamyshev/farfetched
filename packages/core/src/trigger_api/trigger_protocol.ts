import { Event } from 'effector';

export type TriggerProtocol = {
  '@@trigger': () => {
    setup: Event<void>;
    teardown: Event<void>;
    fired: Event<unknown> | Event<void>;
  };
};
