import { createEvent, createStore, sample } from 'effector';

import { keyboardSequence } from '../libs/keyboard';
import { appStarted } from './viewer';

const show = createEvent();

export const $visible = createStore(false).on(show, () => true);

sample({
  clock: keyboardSequence('iddqd', { setup: appStarted }),
  target: show,
});
