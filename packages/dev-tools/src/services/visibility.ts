import { createEvent, createStore, sample } from 'effector';

import { keyboardSequence } from '../libs/keyboard';
import { appStarted } from './viewer';

export const $openSequence = createStore('iddqd');

export const show = createEvent();
export const hide = createEvent();

export const $visible = createStore(
  true
  // false
)
  .on(show, () => true)
  .on(hide, () => false);

sample({
  clock: keyboardSequence($openSequence, { setup: appStarted }),
  target: show,
});
