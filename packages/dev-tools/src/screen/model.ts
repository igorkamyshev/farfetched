import { createEvent, createStore } from 'effector';

export const $open = createStore(true);

export const open = createEvent();
export const close = createEvent();

$open.on(open, () => true);
$open.on(close, () => false);
