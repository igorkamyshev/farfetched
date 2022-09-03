import { createEvent, createStore, Event, sample } from 'effector';
import { expectType } from 'tsd';

import { postpone } from '../postpone';

infer_type_from_the_clock: {
  const clock = createEvent<{ some: number; other: string }>();
  const $until = createStore<boolean>(false);

  const triggered = postpone({ clock, until: $until });

  expectType<Event<{ some: number; other: string }>>(triggered);
}

infer_type_from_the_clock_in_the_sample: {
  const event = createEvent<{ some: number; other: string }>();
  const $until = createStore<boolean>(false);

  const _someSampledEvent = sample({
    clock: postpone({ clock: event, until: $until }),
    source: { until: $until },
    fn({ until }, clock) {
      expectType<boolean>(until);
      expectType<{ some: number; other: string }>(clock);
    },
  });
}
