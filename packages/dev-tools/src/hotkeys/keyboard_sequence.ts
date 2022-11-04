import {
  createEvent,
  createStore,
  Event,
  Store,
  sample,
  scopeBind,
  createEffect,
  is,
} from 'effector';

import { appInited } from '../viewer';

/**
 * Creates an event that triggers after a user types a given sequence on a keyboard in a browser
 *
 * @param wantedSequence - Sequence of keys that should be typed
 */
function keyboardSequence(wantedSequence: Store<string> | string): Event<void> {
  const keypress = createEvent<KeyboardEvent>();

  const $pressedKeys = createStore<string[]>([], { serialize: 'ignore' });

  sample({
    clock: keypress,
    source: $pressedKeys,
    fn: (oldKeys, event) => [...oldKeys, event.key],
    target: $pressedKeys,
  });

  const subscribeFx = createEffect(() => {
    let boundKeypress: (e: KeyboardEvent) => void;

    try {
      boundKeypress = scopeBind(keypress);
    } catch (e) {
      boundKeypress = keypress;
    }

    document.addEventListener('keypress', boundKeypress);
  });

  sample({ clock: appInited, target: subscribeFx });

  const $wantedSequence: Store<string> = is.store(wantedSequence)
    ? wantedSequence
    : createStore(wantedSequence as string, { serialize: 'ignore' });

  const typed = sample({
    source: { pressedKeys: $pressedKeys, wantedSequence: $wantedSequence },
    filter: ({ pressedKeys, wantedSequence }) =>
      pressedKeys.join('').includes(wantedSequence),
    fn: () => {
      // pass
    },
  });

  sample({ clock: typed, fn: () => [], target: $pressedKeys });

  return typed;
}

export { keyboardSequence };
