import { createEvent, createStore, restore, sample } from 'effector';
import { hotkey, keyboardSequence } from '../hotkeys';

export const $open = createStore(true);

export const open = createEvent();
export const close = createEvent();
export const toggle = createEvent();

$open.on(open, () => true);
$open.on(close, () => false);
$open.on(toggle, (state) => !state);

// keyboard shortcuts

export const openSequenceChanged = createEvent<string>();
const $openSequence = restore(openSequenceChanged, 'iddqd');

sample({ clock: hotkey('Escape'), target: close });
sample({ clock: keyboardSequence($openSequence), target: open });
