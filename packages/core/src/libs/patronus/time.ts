import {
  createEffect,
  Event,
  sample,
  Store,
  createStore,
  Effect,
} from 'effector';

const readNowFx = createEffect(() => Date.now());

export function time({
  clock,
}: {
  clock: Event<any> | Effect<any, any, any>;
}): Store<number> {
  const $time = createStore(Date.now(), {
    name: 'ff.$time',
    sid: 'ff.$time',
  });

  sample({
    clock: clock as Event<any>,
    fn: () => {
      // nothing
    },
    target: readNowFx,
  });
  sample({ clock: readNowFx.doneData, target: $time });

  return $time;
}
