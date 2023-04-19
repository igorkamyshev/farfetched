import {
  createEffect,
  createEvent,
  createStore,
  sample,
  type Event,
  type EventAsReturnType,
  type Store,
} from 'effector';

import { not } from './not';

/**
 * Откладывает выполнение события до переданного указанного стора в состояние `true`
 *
 * @returns событие, которое будет вызывано после вызова clock, когда until будет true
 */
export function postpone<T>({
  clock,
  until,
}: {
  clock: Event<T>;
  until: Store<boolean>;
}): EventAsReturnType<T> {
  const target = createEvent<T>();

  const $planned = createStore({ ref: new Set<T>() });

  sample({ clock, filter: until, target });

  sample({
    clock,
    source: $planned,
    filter: not(until),
    fn: (planned, value) => ({ ref: planned.ref.add(value) }),
    target: $planned,
  });

  const runAllPostponedFx = createEffect((params: Set<T>) => {
    for (const param of params.values()) {
      target(param);
    }
  });

  sample({
    clock: until,
    source: $planned,
    filter: until,
    fn: (planned) => planned.ref,
    target: runAllPostponedFx,
  });

  sample({
    clock: runAllPostponedFx.done,
    fn: () => ({ ref: new Set<T>() }),
    target: $planned,
  });

  return target;
}
