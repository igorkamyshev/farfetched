import {
  createEvent,
  createStore,
  sample,
  type Event,
  type EventAsReturnType,
} from 'effector';

import { uniq } from '../lohyphen';

export function combineEvents({
  events,
  reset,
}: {
  events: Array<Event<any>>;
  reset?: Event<any>;
}): EventAsReturnType<void> {
  const target = createEvent();

  const $doneEventIndexes = createStore<number[]>([], { serialize: 'ignore' });

  if (reset) {
    sample({ clock: reset, target: $doneEventIndexes.reinit! });
  }

  events.forEach((event, idx) => {
    $doneEventIndexes.on(event, (indexes) => uniq([...indexes, idx]));
  });

  sample({
    clock: events,
    source: $doneEventIndexes,
    filter: (indexes) => indexes.length === events.length,
    target,
  });

  return target;
}
