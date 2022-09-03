import { Event, EventAsReturnType, sample, Store } from 'effector';

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
  return sample({
    clock: [clock, until],
    source: clock,
    filter: until,
  });
}
