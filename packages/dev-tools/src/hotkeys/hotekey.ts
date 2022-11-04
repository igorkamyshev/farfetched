import {
  createEvent,
  Event,
  Store,
  Target,
  sample,
  createStore,
  createEffect,
} from 'effector';

import { appInited } from '../viewer';
import { validateHotkey } from './validate_hotkey';

export const keyup = createEvent<KeyboardEvent>();
export const keydown = createEvent<KeyboardEvent>();
export const keypress = createEvent<KeyboardEvent>();

export const $isShiftDown = createStore(false);
export const $isCtrlDown = createStore(false);
export const $isAltDown = createStore(false);

$isShiftDown.on([keyup, keydown], (_, evt) => evt.shiftKey);
$isCtrlDown.on([keyup, keydown], (_, evt) => evt.ctrlKey);
$isAltDown.on([keyup, keydown], (_, evt) => evt.altKey);

const keyEvents = {
  keyup,
  keydown,
  keypress,
};

export function hotkey(
  key: KeyboardEvent['key'],
  type?: keyof typeof keyEvents
): Event<KeyboardEvent>;

export function hotkey(params: {
  key: KeyboardEvent['key'];
  type?: keyof typeof keyEvents;
  filter?: Store<boolean>;
  target?: Target;
}): Event<KeyboardEvent>;

export function hotkey(...args: any[]) {
  const normalizedParams =
    typeof args[0] === 'string'
      ? { key: args[0], type: args[1] }
      : {
          key: args[0].key,
          type: args[0].type,
          filter: args[0].filter,
          target: args[0].target,
        };
  let keyTriggered = sample({
    clock: (keyEvents as any)[
      normalizedParams.type || 'keyup'
    ] as Event<KeyboardEvent>,
    filter: validateHotkey(normalizedParams.key),
  });
  if (normalizedParams.filter) {
    keyTriggered = sample({
      clock: keyTriggered,
      filter: normalizedParams.filter as Store<boolean>,
    });
  }
  if (normalizedParams.target) {
    sample({
      clock: keyTriggered,
      target: normalizedParams.target,
    });
  }
  return keyTriggered;
}

const setupSubscriptionFx = createEffect(() => {
  // TODO: handle scope-full
  document.addEventListener('keyup', keyup);
  document.addEventListener('keydown', keydown);
  document.addEventListener('keypress', keypress);
});

sample({ clock: appInited, target: setupSubscriptionFx });
