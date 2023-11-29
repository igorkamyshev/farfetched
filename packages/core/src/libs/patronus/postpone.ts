import {
  createEvent,
  createStore,
  sample,
  type Event,
  type EventAsReturnType,
  type Store,
} from 'effector';

import { and } from './and';
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

  const $fired = createStore(false, {
    serialize: 'ignore',
    name: 'ff.$fired',
    sid: 'ff.$fired',
  })
    .on(target, () => true)
    .on(clock, () => false);

  sample({
    clock: [clock, until],
    source: clock,
    filter: and(until, not($fired)),
    target,
  });

  return target;
}
