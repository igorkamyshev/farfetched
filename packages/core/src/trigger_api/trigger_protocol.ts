import { Event } from 'effector';

export type TriggerProtocol = {
  '@@trigger': () => {
    setup?: Event<void>;
    fired: Event<any>;
  };
};
