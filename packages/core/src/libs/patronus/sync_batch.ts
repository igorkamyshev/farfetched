// Copied and adopted https://github.com/effector/patronum/blob/main/src/debounce/index.ts

import {
  createEvent,
  createStore,
  type Event,
  type EventAsReturnType,
  sample,
  attach,
} from 'effector';

export function syncBatch<T>(clock: Event<T>): EventAsReturnType<T> {
  const saveTimeoutId = createEvent<NodeJS.Timeout>();

  const $timeoutId = createStore<NodeJS.Timeout | null>(null, {
    serialize: 'ignore',
    name: 'ff.$timeoutId',
    sid: 'ff.$timeoutId',
  }).on(saveTimeoutId, (_, id) => id);

  const saveReject = createEvent<() => void>();

  const $rejecter = createStore<(() => void) | null>(null, {
    serialize: 'ignore',
    name: 'ff.$rejecter',
    sid: 'ff.$rejecter',
  }).on(saveReject, (_, rj) => rj);

  const tick = createEvent<T>();

  const timerFx = attach({
    source: {
      timeoutId: $timeoutId,
      rejectPromise: $rejecter,
    },
    effect: ({ timeoutId, rejectPromise }) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rejectPromise) rejectPromise();
      return new Promise((resolve, reject) => {
        saveReject(reject);
        saveTimeoutId(setTimeout(resolve, 0));
      });
    },
  });
  $rejecter.reset(timerFx.done);
  $timeoutId.reset(timerFx.done);

  // It's ok - nothing will ever start unless source is triggered
  const $payload = createStore<T[]>([], {
    serialize: 'ignore',
    name: 'ff.$payload',
    sid: 'ff.$payload',
  }).on(clock, (_, payload) => [payload]);

  const $canTick = createStore(true, {
    serialize: 'ignore',
    sid: 'ff.$canTick',
    name: 'ff.$canTick',
  });

  const triggerTick = createEvent();

  $canTick
    .on(triggerTick, () => false)
    .on(
      [
        tick,
        // debounce timeout can be restarted in later ticks
        timerFx,
      ],
      () => true
    );

  sample({
    clock: clock,
    filter: $canTick,
    target: triggerTick,
  });

  sample({
    clock: triggerTick,
    target: timerFx,
  });

  sample({
    source: $payload,
    clock: timerFx.done,
    fn: ([payload]) => payload,
    target: tick,
  });

  return tick;
}
