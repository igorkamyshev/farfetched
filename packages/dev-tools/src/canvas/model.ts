import { createEvent, restore } from 'effector';

export const selectQuery = createEvent<string>();
export const $selectedId = restore(selectQuery, null);
