import {
  createEffect,
  createEvent,
  sample,
  Unit,
  Event,
  Store,
  EventAsReturnType,
} from 'effector';

import { normalizeStaticOrReactive } from '../../misc/sourced';

export function delay<T>({
  clock,
  timeout,
  target = createEvent<T>(),
}: {
  clock: Unit<T>;
  timeout: Store<number> | number;
  target?: Event<T>;
}): EventAsReturnType<T> {
  const timerFx = createEffect<{ payload: T; milliseconds: number }, T>(
    ({ payload, milliseconds }) =>
      new Promise((resolve) => {
        setTimeout(resolve, milliseconds, payload);
      })
  );

  sample({
    source: normalizeStaticOrReactive(timeout),
    clock,
    fn: (milliseconds, payload) => ({
      payload,
      milliseconds,
    }),
    target: timerFx,
  });

  sample({
    clock: timerFx.doneData,
    target: target,
  });

  return target as unknown as Event<T>;
}
