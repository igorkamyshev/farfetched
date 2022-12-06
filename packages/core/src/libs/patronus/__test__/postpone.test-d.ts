import { describe, test, expectTypeOf } from 'vitest';
import { createEvent, createStore, Event, sample } from 'effector';

import { postpone } from '../postpone';

describe('postpone', () => {
  test('infer type from clock', () => {
    const clock = createEvent<{ some: number; other: string }>();
    const $until = createStore<boolean>(false);

    const triggered = postpone({ clock, until: $until });

    expectTypeOf(triggered).toEqualTypeOf<
      Event<{ some: number; other: string }>
    >();
  });

  test('infer type from clock in the sample', () => {
    const event = createEvent<{ some: number; other: string }>();
    const $until = createStore<boolean>(false);

    const _someSampledEvent = sample({
      clock: postpone({ clock: event, until: $until }),
      source: { until: $until },
      fn({ until }, clock) {
        expectTypeOf(until).toBeBoolean();
        expectTypeOf(clock).toEqualTypeOf<{ some: number; other: string }>();
      },
    });
  });
});
