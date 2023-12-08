import { createEvent, createStore, sample } from 'effector';

export const $visible = createStore(false);
export const show = createEvent();
export const hide = createEvent();

sample({ clock: show, fn: () => true, target: $visible });
sample({ clock: hide, fn: () => false, target: $visible });
